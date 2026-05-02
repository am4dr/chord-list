import { toPitchClass, type Note } from './note';

export type Quality =
  | 'major'
  | 'minor'
  | 'm7'
  | 'M7'
  | 'm9'
  | 'M9'
  | 'sus4'
  | '7sus4';

export const ALL_QUALITIES: ReadonlyArray<Quality> = [
  'major',
  'minor',
  'm7',
  'M7',
  'm9',
  'M9',
  'sus4',
  '7sus4',
];

export interface Chord {
  root: Note;
  quality: Quality;
}

function qualitySuffix(quality: Quality): string {
  switch (quality) {
    case 'major':
      return '';
    case 'minor':
      return 'm';
    default:
      return quality;
  }
}

export function formatChord(chord: Chord): string {
  const accidental =
    chord.root.accidental === 'sharp' ? '#' : chord.root.accidental === 'flat' ? 'b' : '';
  return `${chord.root.natural}${accidental}${qualitySuffix(chord.quality)}`;
}

export function chordsEqual(a: Chord, b: Chord): boolean {
  return a.quality === b.quality && toPitchClass(a.root) === toPitchClass(b.root);
}
