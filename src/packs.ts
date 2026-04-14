import { PackDefinition } from "./types";
import { NOTES } from "./scales";

/**
 * Tibetan singing bowls — rich, meditative, with beating from detuned partials.
 * Non-integer partial ratios give the characteristic metallic warmth.
 */
export const singingBowls: PackDefinition = {
  name: "singing-bowls",
  description: "Warm, meditative tones with shimmering beating effects",
  rootNote: NOTES.C3,
  duration: 3.5,
  envelope: {
    attack: 0.04,
    decay: 0.3,
    sustain: 0.35,
    release: 3.0,
  },
  lowpassCutoff: 2000,
  partials: [
    // Fundamental pair (gentle beating)
    { ratio: 1.0, amplitude: 1.0, phase: 0, decayRate: 0.3 },
    { ratio: 1.0, amplitude: 0.4, detune: 2, phase: 0.8, decayRate: 0.4 },
    // Second partial — bowl overtone, decays faster
    { ratio: 2.71, amplitude: 0.25, phase: 1.2, decayRate: 1.0 },
    { ratio: 2.71, amplitude: 0.12, detune: 3, phase: 2.0, decayRate: 1.2 },
    // Third partial — fades quickly, just adds initial color
    { ratio: 4.77, amplitude: 0.08, phase: 0.5, decayRate: 2.0 },
    { ratio: 4.77, amplitude: 0.05, detune: 4, phase: 1.7, decayRate: 2.5 },
  ],
};

/**
 * Crystal bells — bright but gentle, with upper partials that vanish quickly.
 */
export const crystalBells: PackDefinition = {
  name: "crystal-bells",
  description: "Bright, glassy tones with a sparkling decay",
  rootNote: NOTES.G4,
  duration: 2.5,
  envelope: {
    attack: 0.015,
    decay: 0.15,
    sustain: 0.12,
    release: 2.0,
  },
  lowpassCutoff: 5000,
  partials: [
    { ratio: 1.0, amplitude: 1.0, decayRate: 0.4 },
    { ratio: 2.0, amplitude: 0.3, decayRate: 1.2 },
    { ratio: 3.0, amplitude: 0.12, decayRate: 2.5 },
    { ratio: 4.2, amplitude: 0.05, decayRate: 4.0 },
    { ratio: 5.4, amplitude: 0.02, decayRate: 6.0 },
  ],
};

/**
 * Soft keys — warm, piano-like tones with gentle harmonics.
 */
export const softKeys: PackDefinition = {
  name: "soft-keys",
  description: "Warm, piano-like tones with a gentle touch",
  rootNote: NOTES.C4,
  duration: 2.0,
  envelope: {
    attack: 0.02,
    decay: 0.4,
    sustain: 0.1,
    release: 1.4,
  },
  lowpassCutoff: 2500,
  partials: [
    { ratio: 1.0, amplitude: 1.0, decayRate: 0.3 },
    { ratio: 2.0, amplitude: 0.3, decayRate: 1.0 },
    { ratio: 3.0, amplitude: 0.1, decayRate: 2.0 },
    { ratio: 4.0, amplitude: 0.04, decayRate: 3.5 },
    { ratio: 5.0, amplitude: 0.015, decayRate: 5.0 },
  ],
};

/**
 * Bamboo — hollow, woody tones with a quick natural decay.
 */
export const bamboo: PackDefinition = {
  name: "bamboo",
  description: "Hollow, woody tones — like a bamboo xylophone",
  rootNote: NOTES.D4,
  duration: 1.0,
  envelope: {
    attack: 0.008,
    decay: 0.15,
    sustain: 0.03,
    release: 0.7,
  },
  lowpassCutoff: 3500,
  partials: [
    { ratio: 1.0, amplitude: 1.0, decayRate: 1.0 },
    // Odd harmonics give a hollow/woody character
    { ratio: 3.0, amplitude: 0.12, decayRate: 3.0 },
    { ratio: 5.0, amplitude: 0.03, decayRate: 5.0 },
    // Slight inharmonic partial for realism
    { ratio: 3.89, amplitude: 0.04, decayRate: 4.0 },
  ],
};

/**
 * Celeste — delicate music-box sparkle in a high register.
 */
export const celeste: PackDefinition = {
  name: "celeste",
  description: "Delicate, sparkling music-box tones",
  rootNote: NOTES.C5,
  duration: 1.8,
  envelope: {
    attack: 0.01,
    decay: 0.1,
    sustain: 0.06,
    release: 1.4,
  },
  lowpassCutoff: 6000,
  tremoloRate: 5,
  tremoloDepth: 0.05,
  partials: [
    { ratio: 1.0, amplitude: 1.0, decayRate: 0.5 },
    { ratio: 2.0, amplitude: 0.2, decayRate: 2.0 },
    { ratio: 3.0, amplitude: 0.06, decayRate: 4.0 },
  ],
};

/** All available packs */
export const ALL_PACKS: PackDefinition[] = [
  singingBowls,
  crystalBells,
  softKeys,
  bamboo,
  celeste,
];
