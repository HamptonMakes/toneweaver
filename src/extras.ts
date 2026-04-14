import { PackDefinition } from "./types";
import { pentatonicScale } from "./scales";
import { generateTone, SAMPLE_RATE } from "./generator";

/**
 * Generate a success/win sound — ascending pentatonic arpeggio using the pack's timbre.
 * Plays notes with overlap so they ring together into a warm chord.
 */
export function generateSuccess(pack: PackDefinition): Float64Array {
  const frequencies = pentatonicScale(pack.rootNote);
  // Use notes 0, 2, 4, 5 (root, third, fifth, octave) for a satisfying resolution
  const arpeggioNotes = [0, 2, 4, 5];
  const noteDelay = 0.15; // seconds between each note onset
  const totalDuration =
    pack.duration + noteDelay * (arpeggioNotes.length - 1);
  const totalSamples = Math.ceil(totalDuration * SAMPLE_RATE);
  const mixed = new Float64Array(totalSamples);

  for (let n = 0; n < arpeggioNotes.length; n++) {
    const freq = frequencies[arpeggioNotes[n]];
    const tone = generateTone(freq, pack);
    const offsetSamples = Math.floor(n * noteDelay * SAMPLE_RATE);

    for (let i = 0; i < tone.length; i++) {
      const target = offsetSamples + i;
      if (target < totalSamples) {
        mixed[target] += tone[i];
      }
    }
  }

  // Normalize the mix
  let peak = 0;
  for (let i = 0; i < totalSamples; i++) {
    peak = Math.max(peak, Math.abs(mixed[i]));
  }
  if (peak > 0) {
    const gain = 0.95 / peak;
    for (let i = 0; i < totalSamples; i++) {
      mixed[i] *= gain;
    }
  }

  return mixed;
}

/**
 * Generate a seamlessly looping ambient background drone.
 * Uses very low, slowly beating detuned sines with gentle modulation.
 */
export function generateAmbient(
  pack: PackDefinition,
  durationSeconds: number = 30
): Float64Array {
  const totalSamples = Math.ceil(durationSeconds * SAMPLE_RATE);
  const samples = new Float64Array(totalSamples);

  // Use root and fifth of the scale as drone notes (always consonant)
  const frequencies = pentatonicScale(pack.rootNote);
  const droneFreq = frequencies[0] / 2; // One octave below root
  const fifthFreq = frequencies[3] / 2; // Fifth, also one octave down

  // Drone partials: pairs of slightly detuned sines for slow beating
  const drones = [
    { freq: droneFreq, amplitude: 1.0 },
    { freq: droneFreq * 1.001, amplitude: 0.7 }, // ~0.13 Hz beat
    { freq: fifthFreq, amplitude: 0.4 },
    { freq: fifthFreq * 1.0015, amplitude: 0.25 }, // ~0.15 Hz beat
    // Soft octave above root
    { freq: droneFreq * 2, amplitude: 0.15 },
    { freq: droneFreq * 2.002, amplitude: 0.1 },
  ];

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    let sample = 0;

    for (const d of drones) {
      sample += Math.sin(2 * Math.PI * d.freq * t) * d.amplitude;
    }

    // Very slow amplitude modulation for gentle breathing feel
    const breathe = 0.85 + 0.15 * Math.sin(2 * Math.PI * 0.05 * t);
    sample *= breathe;

    samples[i] = sample;
  }

  // Apply low-pass for warmth (always filter ambient)
  const cutoff = pack.lowpassCutoff ?? 800;
  const rc = 1 / (2 * Math.PI * cutoff);
  const dt = 1 / SAMPLE_RATE;
  const alpha = dt / (rc + dt);
  let prev = samples[0];
  for (let i = 1; i < totalSamples; i++) {
    prev = prev + alpha * (samples[i] - prev);
    samples[i] = prev;
  }

  // Crossfade the last 2 seconds with the first 2 seconds for seamless looping
  const fadeSamples = Math.floor(2 * SAMPLE_RATE);
  for (let i = 0; i < fadeSamples; i++) {
    const fadeOut = 1 - i / fadeSamples;
    const fadeIn = i / fadeSamples;
    // Blend the tail into a copy of the start
    const startVal = samples[i];
    const endIdx = totalSamples - fadeSamples + i;
    samples[endIdx] = samples[endIdx] * fadeOut + startVal * (1 - fadeOut);
  }

  // Normalize
  let peak = 0;
  for (let i = 0; i < totalSamples; i++) {
    peak = Math.max(peak, Math.abs(samples[i]));
  }
  if (peak > 0) {
    const gain = 0.95 / peak;
    for (let i = 0; i < totalSamples; i++) {
      samples[i] *= gain;
    }
  }

  return samples;
}
