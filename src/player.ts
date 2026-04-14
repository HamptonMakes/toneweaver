/**
 * Runtime audio player for React Native (and web).
 *
 * Uses the Web Audio API (via react-native-audio-api on mobile)
 * to synthesize tones from PackDefinitions at runtime — zero audio assets needed.
 *
 * Usage:
 *   import { AudioContext } from 'react-native-audio-api';
 *   import { TonePlayer } from 'toneweaver/player';
 *   import { singingBowls } from 'toneweaver/packs';
 *
 *   const ctx = new AudioContext();
 *   const player = new TonePlayer(ctx, singingBowls);
 *   player.playNote(0);    // button press
 *   player.playSuccess();  // win
 *   player.startAmbient(); // background drone
 */

import { PackDefinition, Partial as TonePartial } from "./types";
import { pentatonicScale } from "./scales";

// Use a minimal interface so this works with both the browser's
// AudioContext and react-native-audio-api's AudioContext.
interface AudioParam {
  value: number;
  setValueAtTime(value: number, time: number): void;
  linearRampToValueAtTime(value: number, time: number): void;
  exponentialRampToValueAtTime(value: number, time: number): void;
  setTargetAtTime(target: number, startTime: number, timeConstant: number): void;
  cancelScheduledValues(time: number): void;
}

interface GainNode {
  gain: AudioParam;
  connect(dest: any): any;
  disconnect(): void;
}

interface OscillatorNode {
  frequency: AudioParam;
  detune: AudioParam;
  type: string;
  connect(dest: any): any;
  start(time?: number): void;
  stop(time?: number): void;
}

interface BiquadFilterNode {
  frequency: AudioParam;
  type: string;
  connect(dest: any): any;
  disconnect(): void;
}

interface MinimalAudioContext {
  currentTime: number;
  destination: any;
  createOscillator(): OscillatorNode;
  createGain(): GainNode;
  createBiquadFilter(): BiquadFilterNode;
}

export class TonePlayer {
  private ctx: MinimalAudioContext;
  private pack: PackDefinition;
  private frequencies: number[];
  private masterGain: GainNode;
  private ambientNodes: { oscillators: OscillatorNode[]; gains: GainNode[] } | null = null;

  constructor(audioContext: MinimalAudioContext, pack: PackDefinition) {
    this.ctx = audioContext;
    this.pack = pack;
    this.frequencies = pentatonicScale(pack.rootNote);

    // Master gain for overall volume control
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 1.0;
    this.masterGain.connect(this.ctx.destination);
  }

  /** Switch to a different sound pack without creating a new player. */
  setPack(pack: PackDefinition): void {
    this.stopAmbient();
    this.pack = pack;
    this.frequencies = pentatonicScale(pack.rootNote);
  }

  /** Set master volume (0–1). */
  setVolume(volume: number): void {
    this.masterGain.gain.value = Math.max(0, Math.min(1, volume));
  }

  /**
   * Play a single tone by button index (0–5).
   * Each call creates fresh nodes — they clean themselves up after the tone ends.
   */
  playNote(index: number): void {
    if (index < 0 || index >= this.frequencies.length) return;
    this.playFrequency(this.frequencies[index]);
  }

  /**
   * Play the success/win arpeggio — ascending root, third, fifth, octave.
   */
  playSuccess(): void {
    const noteDelay = 0.15;
    const indices = [0, 2, 4, 5]; // root, third, fifth, octave
    const now = this.ctx.currentTime;

    for (let i = 0; i < indices.length; i++) {
      const freq = this.frequencies[indices[i]];
      this.playFrequency(freq, now + i * noteDelay);
    }
  }

  /**
   * Start the ambient background drone. Call stopAmbient() to end it.
   */
  startAmbient(volume: number = 0.3): void {
    if (this.ambientNodes) return; // already playing

    const droneFreq = this.frequencies[0] / 2; // octave below root
    const fifthFreq = this.frequencies[3] / 2; // fifth, octave below

    const drones = [
      { freq: droneFreq, amp: 0.35 },
      { freq: droneFreq * 1.001, amp: 0.25 }, // beating pair
      { freq: fifthFreq, amp: 0.15 },
      { freq: fifthFreq * 1.0015, amp: 0.1 }, // beating pair
      { freq: droneFreq * 2, amp: 0.06 },
      { freq: droneFreq * 2.002, amp: 0.04 },
    ];

    const oscillators: OscillatorNode[] = [];
    const gains: GainNode[] = [];

    // Overall ambient gain (for fade in/out)
    const ambientGain = this.ctx.createGain();
    ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
    ambientGain.gain.linearRampToValueAtTime(volume, this.ctx.currentTime + 2);

    // Low-pass filter for warmth
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;
    filter.connect(ambientGain);
    ambientGain.connect(this.masterGain);

    for (const d of drones) {
      const osc = this.ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = d.freq;

      const gain = this.ctx.createGain();
      gain.gain.value = d.amp;

      osc.connect(gain);
      gain.connect(filter);
      osc.start(this.ctx.currentTime);

      oscillators.push(osc);
      gains.push(gain);
    }

    // Store for cleanup — include the ambient gain and filter in gains array
    gains.push(ambientGain);
    this.ambientNodes = { oscillators, gains };
  }

  /** Fade out and stop the ambient drone. */
  stopAmbient(): void {
    if (!this.ambientNodes) return;

    const fadeTime = 1.5;
    const now = this.ctx.currentTime;

    // Fade out the last gain node (the ambient master)
    const ambientGain = this.ambientNodes.gains[this.ambientNodes.gains.length - 1];
    ambientGain.gain.setValueAtTime(ambientGain.gain.value, now);
    ambientGain.gain.linearRampToValueAtTime(0.0001, now + fadeTime);

    // Schedule oscillator stops after fade
    for (const osc of this.ambientNodes.oscillators) {
      osc.stop(now + fadeTime + 0.1);
    }

    this.ambientNodes = null;
  }

  /** Clean up the audio context connection. */
  dispose(): void {
    this.stopAmbient();
    this.masterGain.disconnect();
  }

  // --- Private ---

  private playFrequency(frequency: number, startTime?: number): void {
    const now = startTime ?? this.ctx.currentTime;
    const pack = this.pack;
    const env = pack.envelope;

    // Timing
    const attackEnd = now + env.attack;
    const decayEnd = attackEnd + env.decay;
    const releaseStart = now + pack.duration - env.release;
    const endTime = now + pack.duration;

    // Optional low-pass filter
    let outputNode: any = this.masterGain;
    let filterNode: BiquadFilterNode | null = null;
    if (pack.lowpassCutoff) {
      filterNode = this.ctx.createBiquadFilter();
      filterNode.type = "lowpass";
      filterNode.frequency.value = pack.lowpassCutoff;
      filterNode.connect(this.masterGain);
      outputNode = filterNode;
    }

    // Create one oscillator + gain per partial
    for (const partial of pack.partials) {
      this.createPartial(partial, frequency, outputNode, now, endTime, env, pack);
    }
  }

  private createPartial(
    partial: TonePartial,
    baseFrequency: number,
    output: any,
    startTime: number,
    endTime: number,
    env: PackDefinition["envelope"],
    pack: PackDefinition
  ): void {
    const osc = this.ctx.createOscillator();
    osc.type = "sine";

    const freq = baseFrequency * partial.ratio;
    osc.frequency.value = freq;

    // Apply detuning in cents
    if (partial.detune) {
      osc.detune.value = partial.detune;
    }

    // Gain node for this partial's envelope
    const gain = this.ctx.createGain();

    // Scale amplitude — normalize against sum of all partial amplitudes
    const peakAmp = partial.amplitude * 0.3; // Scale down to avoid clipping when overlapping

    const attackEnd = startTime + env.attack;
    const decayEnd = attackEnd + env.decay;
    const releaseStart = Math.max(decayEnd, endTime - env.release);

    // ADSR envelope using AudioParam scheduling
    gain.gain.setValueAtTime(0.0001, startTime);

    // Attack: ramp to peak
    gain.gain.linearRampToValueAtTime(peakAmp, attackEnd);

    // Decay: exponential fall to sustain
    const sustainAmp = peakAmp * env.sustain;
    gain.gain.setTargetAtTime(
      Math.max(sustainAmp, 0.0001),
      attackEnd,
      env.decay / 4 // time constant — reaches ~98% of target in 4x this value
    );

    // Release: exponential fade to silence
    // Schedule the release start
    gain.gain.setValueAtTime(Math.max(sustainAmp, 0.0001), releaseStart);
    gain.gain.setTargetAtTime(0.0001, releaseStart, env.release / 4);

    // Per-partial decay: if this partial has its own decay rate,
    // apply an additional exponential fade
    if (partial.decayRate && partial.decayRate > 0) {
      // Create a second gain node for per-partial decay
      const partialDecay = this.ctx.createGain();
      partialDecay.gain.setValueAtTime(1.0, startTime);
      partialDecay.gain.setTargetAtTime(
        0.0001,
        startTime,
        1 / partial.decayRate // convert rate to time constant
      );

      osc.connect(partialDecay);
      partialDecay.connect(gain);
    } else {
      osc.connect(gain);
    }

    gain.connect(output);

    // Start and schedule stop
    osc.start(startTime);
    osc.stop(endTime + 0.1); // small buffer past end
  }
}
