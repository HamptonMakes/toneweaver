/**
 * Penatonic scale intervals in semitones: root, M2, M3, P5, M6, octave.
 * 6 notes — one per button. Any combination sounds pleasant.
 */
const PENTATONIC_INTERVALS = [0, 2, 4, 7, 9, 12];

/**
 * Given a root frequency, return 6 pentatonic scale frequencies.
 */
export function pentatonicScale(rootFreq: number): number[] {
  return PENTATONIC_INTERVALS.map((semitones) =>
    rootFreq * Math.pow(2, semitones / 12)
  );
}

/** Common root frequencies */
export const NOTES = {
  C3: 130.81,
  D3: 146.83,
  E3: 164.81,
  G3: 196.0,
  A3: 220.0,
  C4: 261.63,
  D4: 293.66,
  E4: 329.63,
  G4: 392.0,
  A4: 440.0,
  C5: 523.25,
  G5: 783.99,
} as const;
