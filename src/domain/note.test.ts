import { describe, expect, it } from 'vitest';
import { toPitchClass, type Note } from './note';

describe('toPitchClass', () => {
  it('maps natural notes to their pitch class', () => {
    expect(toPitchClass({ natural: 'C' })).toBe(0);
    expect(toPitchClass({ natural: 'D' })).toBe(2);
    expect(toPitchClass({ natural: 'E' })).toBe(4);
    expect(toPitchClass({ natural: 'F' })).toBe(5);
    expect(toPitchClass({ natural: 'G' })).toBe(7);
    expect(toPitchClass({ natural: 'A' })).toBe(9);
    expect(toPitchClass({ natural: 'B' })).toBe(11);
  });

  it('shifts a sharp up one semitone', () => {
    expect(toPitchClass({ natural: 'C', accidental: 'sharp' })).toBe(1);
    expect(toPitchClass({ natural: 'F', accidental: 'sharp' })).toBe(6);
  });

  it('shifts a flat down one semitone', () => {
    expect(toPitchClass({ natural: 'D', accidental: 'flat' })).toBe(1);
    expect(toPitchClass({ natural: 'B', accidental: 'flat' })).toBe(10);
  });

  it('treats enharmonic notes as the same pitch class', () => {
    const cSharp: Note = { natural: 'C', accidental: 'sharp' };
    const dFlat: Note = { natural: 'D', accidental: 'flat' };
    expect(toPitchClass(cSharp)).toBe(toPitchClass(dFlat));

    const fSharp: Note = { natural: 'F', accidental: 'sharp' };
    const gFlat: Note = { natural: 'G', accidental: 'flat' };
    expect(toPitchClass(fSharp)).toBe(toPitchClass(gFlat));
  });

  it('wraps around the octave (Cb -> 11, B# -> 0)', () => {
    expect(toPitchClass({ natural: 'C', accidental: 'flat' })).toBe(11);
    expect(toPitchClass({ natural: 'B', accidental: 'sharp' })).toBe(0);
  });
});
