import { Envelope, PackDefinition } from "./types";
import { pentatonicScale } from "./scales";

const SAMPLE_RATE = 44100;

/**
 * Compute ADSR envelope value at time t.
 * Uses smooth curves throughout: raised-cosine attack, exponential decay & release.
 */
function envelopeAt(t: number, duration: number, env: Envelope): number {
  const attackEnd = env.attack;
  const decayEnd = attackEnd + env.decay;
  const releaseStart = Math.max(decayEnd, duration - env.release);

  if (t <= 0) return 0;

  if (t < attackEnd) {
    // Smooth attack (raised cosine — no harsh onset)
    return 0.5 * (1 - Math.cos(Math.PI * (t / env.attack)));
  }

  if (t < decayEnd) {
    // Exponential decay: 1 → sustain
    const progress = (t - attackEnd) / env.decay;
    return env.sustain + (1 - env.sustain) * Math.exp(-4 * progress);
  }

  if (t < releaseStart) {
    // Sustain
    return env.sustain;
  }

  // Exponential release for natural fade-out
  const progress = (t - releaseStart) / env.release;
  return env.sustain * Math.exp(-4 * progress);
}

/**
 * Generate a single tone as floating-point samples.
 */
export function generateTone(
  frequency: number,
  pack: PackDefinition
): Float64Array {
  const totalSamples = Math.ceil(pack.duration * SAMPLE_RATE);
  const samples = new Float64Array(totalSamples);

  // Pre-compute phase increments for each partial
  const partials = pack.partials.map((p) => {
    const baseFreq = frequency * p.ratio;
    const detuneMultiplier = p.detune
      ? Math.pow(2, p.detune / 1200)
      : 1;
    const freq = baseFreq * detuneMultiplier;
    return {
      phaseIncrement: (2 * Math.PI * freq) / SAMPLE_RATE,
      amplitude: p.amplitude,
      phase: p.phase ?? 0,
      decayRate: p.decayRate ?? 0,
    };
  });

  for (let i = 0; i < totalSamples; i++) {
    const t = i / SAMPLE_RATE;
    let sample = 0;

    // Sum all partials, each with its own decay rate
    for (const p of partials) {
      const partialEnv = p.decayRate > 0 ? Math.exp(-p.decayRate * t) : 1;
      sample += Math.sin(p.phase + p.phaseIncrement * i) * p.amplitude * partialEnv;
    }

    // Tremolo (amplitude modulation)
    if (pack.tremoloRate && pack.tremoloDepth) {
      const trem =
        1 -
        pack.tremoloDepth *
          (0.5 + 0.5 * Math.sin(2 * Math.PI * pack.tremoloRate * t));
      sample *= trem;
    }

    // Envelope
    sample *= envelopeAt(t, pack.duration, pack.envelope);

    samples[i] = sample;
  }

  // Low-pass filter for warmth
  if (pack.lowpassCutoff) {
    applyLowpass(samples, pack.lowpassCutoff, SAMPLE_RATE);
  }

  normalize(samples);
  return samples;
}

/**
 * One-pole low-pass filter — simple but effective for softening.
 */
function applyLowpass(
  samples: Float64Array,
  cutoff: number,
  sampleRate: number
): void {
  const rc = 1 / (2 * Math.PI * cutoff);
  const dt = 1 / sampleRate;
  const alpha = dt / (rc + dt);
  let prev = samples[0];
  for (let i = 1; i < samples.length; i++) {
    prev = prev + alpha * (samples[i] - prev);
    samples[i] = prev;
  }
}

/**
 * Normalize samples to 95% peak to avoid clipping.
 */
function normalize(samples: Float64Array): void {
  let peak = 0;
  for (let i = 0; i < samples.length; i++) {
    peak = Math.max(peak, Math.abs(samples[i]));
  }
  if (peak > 0) {
    const gain = 0.95 / peak;
    for (let i = 0; i < samples.length; i++) {
      samples[i] *= gain;
    }
  }
}

/**
 * Generate all 6 tones for a pack (one per button).
 * Returns an array of { noteIndex, frequency, samples }.
 */
export function generatePack(pack: PackDefinition) {
  const frequencies = pentatonicScale(pack.rootNote);

  return frequencies.map((freq, index) => ({
    noteIndex: index,
    frequency: freq,
    samples: generateTone(freq, pack),
  }));
}

export { SAMPLE_RATE };
