import { chordsEqual, type Chord } from './chord';
import { FINGERINGS } from './fingerings.data';

/**
 * Standard tuning (EADGBE). frets[0] = 6th string (low E), frets[5] = 1st string (high E).
 * null = muted, 0 = open, 1+ = fret number.
 */
export interface Fingering {
  frets: ReadonlyArray<number | null>;
}

export function getFingering(chord: Chord): Fingering | null {
  const entry = FINGERINGS.find((e) => chordsEqual(e.chord, chord));
  return entry ? entry.fingering : null;
}
