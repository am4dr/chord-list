import type { Chord, Quality } from './chord';
import type { Fingering } from './fingering';
import { toPitchClass, type Note } from './note';

interface Entry {
  chord: Chord;
  fingering: Fingering;
}

const HAND_CRAFTED: ReadonlyArray<Entry> = [
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

type Pattern = ReadonlyArray<number | null>;

// Patterns are written for the open root position (offset 0).
// Shifting up by N adds N to every non-null entry. The major/minor entries
// at offset 0 are exactly the open E / open A chord shapes.
const A_SHAPE: Record<Quality, Pattern> = {
  major: [null, 0, 2, 2, 2, 0],
  minor: [null, 0, 2, 2, 1, 0],
  m7: [null, 0, 2, 0, 1, 0],
  M7: [null, 0, 2, 1, 2, 0],
  m9: [null, 0, 5, 5, 5, 7],
  M9: [null, 0, 6, 6, 5, 7],
  sus4: [null, 0, 2, 2, 3, 0],
  '7sus4': [null, 0, 2, 0, 3, 0],
};

const E_SHAPE: Record<Quality, Pattern> = {
  major: [0, 2, 2, 1, 0, 0],
  minor: [0, 2, 2, 0, 0, 0],
  m7: [0, 2, 0, 0, 0, 0],
  M7: [0, 2, 1, 1, 0, 0],
  m9: [0, 2, 0, 0, 0, 2],
  M9: [0, 2, 1, 1, 0, 2],
  sus4: [0, 2, 2, 2, 0, 0],
  '7sus4': [0, 2, 0, 2, 0, 0],
};

const ROOTS: ReadonlyArray<Note> = [
  { natural: 'C' },
  { natural: 'C', accidental: 'sharp' },
  { natural: 'D' },
  { natural: 'D', accidental: 'sharp' },
  { natural: 'E' },
  { natural: 'F' },
  { natural: 'F', accidental: 'sharp' },
  { natural: 'G' },
  { natural: 'G', accidental: 'sharp' },
  { natural: 'A' },
  { natural: 'A', accidental: 'sharp' },
  { natural: 'B' },
];

const E_ROOT_PITCH = 4;
const A_ROOT_PITCH = 9;

type ExtendedQuality = Exclude<Quality, 'major' | 'minor'>;
const EXTENDED_QUALITIES: ReadonlyArray<ExtendedQuality> = [
  'm7',
  'M7',
  'm9',
  'M9',
  'sus4',
  '7sus4',
];

function shift(pattern: Pattern, offset: number): Fingering {
  return {
    frets: pattern.map((f) => (f === null ? null : f + offset)),
  };
}

// m9 / M9 stretch poorly when an A-shape barre is shifted up the neck,
// so always use the E-shape barre for those.
function isEShapeOnly(quality: Quality): boolean {
  return quality === 'm9' || quality === 'M9';
}

/**
 * Returns generated barre voicings (E-shape and A-shape) for the chord,
 * ordered by which sits lower on the neck. m9 / M9 return only the E-shape.
 */
export function generateBarreCandidates(chord: Chord): Fingering[] {
  const pc = toPitchClass(chord.root);
  const eOffset = (pc - E_ROOT_PITCH + 12) % 12;
  const aOffset = (pc - A_ROOT_PITCH + 12) % 12;
  const eShape = shift(E_SHAPE[chord.quality], eOffset);

  if (isEShapeOnly(chord.quality)) return [eShape];

  const aShape = shift(A_SHAPE[chord.quality], aOffset);
  return eOffset <= aOffset ? [eShape, aShape] : [aShape, eShape];
}

function generateExtended(): Entry[] {
  const entries: Entry[] = [];
  for (const root of ROOTS) {
    for (const quality of EXTENDED_QUALITIES) {
      const [primary] = generateBarreCandidates({ root, quality });
      entries.push({ chord: { root, quality }, fingering: primary });
    }
  }
  return entries;
}

export const FINGERINGS: ReadonlyArray<Entry> = [...HAND_CRAFTED, ...generateExtended()];
