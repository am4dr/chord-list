import type { Chord } from './chord';
import type { Fingering } from './fingering';

interface Entry {
  chord: Chord;
  fingering: Fingering;
}

export const FINGERINGS: ReadonlyArray<Entry> = [
  // Major
  { chord: { root: { natural: 'C' }, quality: 'major' }, fingering: { frets: [null, 3, 2, 0, 1, 0] } },
  { chord: { root: { natural: 'C', accidental: 'sharp' }, quality: 'major' }, fingering: { frets: [null, 4, 6, 6, 6, 4] } },
  { chord: { root: { natural: 'D' }, quality: 'major' }, fingering: { frets: [null, null, 0, 2, 3, 2] } },
  { chord: { root: { natural: 'D', accidental: 'sharp' }, quality: 'major' }, fingering: { frets: [null, 6, 8, 8, 8, 6] } },
  { chord: { root: { natural: 'E' }, quality: 'major' }, fingering: { frets: [0, 2, 2, 1, 0, 0] } },
  { chord: { root: { natural: 'F' }, quality: 'major' }, fingering: { frets: [1, 3, 3, 2, 1, 1] } },
  { chord: { root: { natural: 'F', accidental: 'sharp' }, quality: 'major' }, fingering: { frets: [2, 4, 4, 3, 2, 2] } },
  { chord: { root: { natural: 'G' }, quality: 'major' }, fingering: { frets: [3, 2, 0, 0, 0, 3] } },
  { chord: { root: { natural: 'G', accidental: 'sharp' }, quality: 'major' }, fingering: { frets: [4, 6, 6, 5, 4, 4] } },
  { chord: { root: { natural: 'A' }, quality: 'major' }, fingering: { frets: [null, 0, 2, 2, 2, 0] } },
  { chord: { root: { natural: 'A', accidental: 'sharp' }, quality: 'major' }, fingering: { frets: [null, 1, 3, 3, 3, 1] } },
  { chord: { root: { natural: 'B' }, quality: 'major' }, fingering: { frets: [null, 2, 4, 4, 4, 2] } },

  // Minor
  { chord: { root: { natural: 'C' }, quality: 'minor' }, fingering: { frets: [null, 3, 5, 5, 4, 3] } },
  { chord: { root: { natural: 'C', accidental: 'sharp' }, quality: 'minor' }, fingering: { frets: [null, 4, 6, 6, 5, 4] } },
  { chord: { root: { natural: 'D' }, quality: 'minor' }, fingering: { frets: [null, null, 0, 2, 3, 1] } },
  { chord: { root: { natural: 'D', accidental: 'sharp' }, quality: 'minor' }, fingering: { frets: [null, 6, 8, 8, 7, 6] } },
  { chord: { root: { natural: 'E' }, quality: 'minor' }, fingering: { frets: [0, 2, 2, 0, 0, 0] } },
  { chord: { root: { natural: 'F' }, quality: 'minor' }, fingering: { frets: [1, 3, 3, 1, 1, 1] } },
  { chord: { root: { natural: 'F', accidental: 'sharp' }, quality: 'minor' }, fingering: { frets: [2, 4, 4, 2, 2, 2] } },
  { chord: { root: { natural: 'G' }, quality: 'minor' }, fingering: { frets: [3, 5, 5, 3, 3, 3] } },
  { chord: { root: { natural: 'G', accidental: 'sharp' }, quality: 'minor' }, fingering: { frets: [4, 6, 6, 4, 4, 4] } },
  { chord: { root: { natural: 'A' }, quality: 'minor' }, fingering: { frets: [null, 0, 2, 2, 1, 0] } },
  { chord: { root: { natural: 'A', accidental: 'sharp' }, quality: 'minor' }, fingering: { frets: [null, 1, 3, 3, 2, 1] } },
  { chord: { root: { natural: 'B' }, quality: 'minor' }, fingering: { frets: [null, 2, 4, 4, 3, 2] } },
];
