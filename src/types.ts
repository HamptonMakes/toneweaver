export interface Envelope {
  /** Time in seconds to reach peak amplitude */
  attack: number;
  /** Time in seconds to decay from peak to sustain level */
  decay: number;
  /** Amplitude level held after decay (0–1) */
  sustain: number;
  /** Time in seconds to fade from sustain to silence */
  release: number;
}

export interface Partial {
  /** Frequency ratio relative to the fundamental (1.0 = fundamental) */
  ratio: number;
  /** Relative amplitude (0–1) */
  amplitude: number;
  /** Detuning in cents — creates beating/shimmer when paired with an un-detuned partial */
  detune?: number;
  /** Phase offset in radians (0–2π) — spreads partials for more natural onset */
  phase?: number;
  /** Per-partial decay rate — higher values make this partial fade faster.
   *  Essential for realism: upper partials should decay quicker than the fundamental. */
  decayRate?: number;
}

export interface PackDefinition {
  name: string;
  description: string;
  /** Root frequency in Hz — pentatonic scale is built from this */
  rootNote: number;
  /** Total duration of each tone in seconds */
  duration: number;
  /** ADSR envelope shape */
  envelope: Envelope;
  /** Harmonic/inharmonic partials that define the timbre */
  partials: Partial[];
  /** Amplitude modulation rate in Hz (gentle pulsing) */
  tremoloRate?: number;
  /** Amplitude modulation depth (0–1) */
  tremoloDepth?: number;
  /** Low-pass filter cutoff in Hz — softens harsh upper frequencies */
  lowpassCutoff?: number;
}
