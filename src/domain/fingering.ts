import { chordsEqual, type Chord } from './chord';
import { FINGERINGS, generateBarreCandidates } from './fingerings.data';

/**
 * Standard tuning (EADGBE). frets[0] = 6th string (low E), frets[5] = 1st string (high E).
 * null = muted, 0 = open, 1+ = fret number.
 */
export interface Fingering {
  frets: ReadonlyArray<number | null>;
}

export interface ChordVoicing {
  chord: Chord;
  fingering: Fingering;
}

export function getFingering(chord: Chord): Fingering | null {
  const entry = FINGERINGS.find((e) => chordsEqual(e.chord, chord));
  return entry ? entry.fingering : null;
}

function fingeringsEqual(a: Fingering, b: Fingering): boolean {
  if (a.frets.length !== b.frets.length) return false;
  return a.frets.every((f, i) => f === b.frets[i]);
}

/**
 * Returns all known voicings for the chord: hand-crafted entries first
 * (typically the open shape), then generated barre voicings, deduplicated.
 */
export function getFingeringCandidates(chord: Chord): Fingering[] {
  const result: Fingering[] = [];
  for (const entry of FINGERINGS) {
    if (
      chordsEqual(entry.chord, chord) &&
      !result.some((f) => fingeringsEqual(f, entry.fingering))
    ) {
      result.push(entry.fingering);
    }
  }
  for (const candidate of generateBarreCandidates(chord)) {
    if (!result.some((f) => fingeringsEqual(f, candidate))) {
      result.push(candidate);
    }
  }
  return result;
}
