export type NaturalNote = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B';
export type Accidental = 'sharp' | 'flat';
export type PitchClass = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

export interface Note {
  natural: NaturalNote;
  accidental?: Accidental;
}

const NATURAL_PITCH: Record<NaturalNote, PitchClass> = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
};

export function toPitchClass(note: Note): PitchClass {
  const base = NATURAL_PITCH[note.natural];
  const offset = note.accidental === 'sharp' ? 1 : note.accidental === 'flat' ? -1 : 0;
  return (((base + offset) % 12) + 12) % 12 as PitchClass;
}
