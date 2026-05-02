import { toPitchClass, type Note } from './note';

export type Quality = 'major' | 'minor';

export interface Chord {
  root: Note;
  quality: Quality;
}

export function formatChord(chord: Chord): string {
  const accidental =
    chord.root.accidental === 'sharp' ? '#' : chord.root.accidental === 'flat' ? 'b' : '';
  const qualitySuffix = chord.quality === 'minor' ? 'm' : '';
  return `${chord.root.natural}${accidental}${qualitySuffix}`;
}

export function chordsEqual(a: Chord, b: Chord): boolean {
  return a.quality === b.quality && toPitchClass(a.root) === toPitchClass(b.root);
}
