import { describe, expect, it } from 'vitest';
import { chordsEqual, formatChord, type Chord } from './chord';

describe('formatChord', () => {
  it('formats major naturals without a suffix', () => {
    expect(formatChord({ root: { natural: 'C' }, quality: 'major' })).toBe('C');
    expect(formatChord({ root: { natural: 'F' }, quality: 'major' })).toBe('F');
  });

  it('uses # for sharps and b for flats', () => {
    expect(formatChord({ root: { natural: 'F', accidental: 'sharp' }, quality: 'major' })).toBe(
      'F#',
    );
    expect(formatChord({ root: { natural: 'B', accidental: 'flat' }, quality: 'major' })).toBe(
      'Bb',
    );
  });

  it('appends a lowercase m for minor chords', () => {
    expect(formatChord({ root: { natural: 'A' }, quality: 'minor' })).toBe('Am');
    expect(formatChord({ root: { natural: 'C', accidental: 'sharp' }, quality: 'minor' })).toBe(
      'C#m',
    );
    expect(formatChord({ root: { natural: 'E', accidental: 'flat' }, quality: 'minor' })).toBe(
      'Ebm',
    );
  });

  it('appends extended quality suffixes verbatim', () => {
    expect(formatChord({ root: { natural: 'A' }, quality: 'm7' })).toBe('Am7');
    expect(formatChord({ root: { natural: 'C' }, quality: 'M7' })).toBe('CM7');
    expect(formatChord({ root: { natural: 'A' }, quality: 'm9' })).toBe('Am9');
    expect(formatChord({ root: { natural: 'C' }, quality: 'M9' })).toBe('CM9');
    expect(formatChord({ root: { natural: 'D' }, quality: 'sus4' })).toBe('Dsus4');
    expect(formatChord({ root: { natural: 'A' }, quality: '7sus4' })).toBe('A7sus4');
    expect(formatChord({ root: { natural: 'F', accidental: 'sharp' }, quality: 'm7' })).toBe(
      'F#m7',
    );
  });
});

describe('chordsEqual', () => {
  it('treats enharmonic roots with the same quality as equal', () => {
    const cSharpMajor: Chord = {
      root: { natural: 'C', accidental: 'sharp' },
      quality: 'major',
    };
    const dFlatMajor: Chord = {
      root: { natural: 'D', accidental: 'flat' },
      quality: 'major',
    };
    expect(chordsEqual(cSharpMajor, dFlatMajor)).toBe(true);
  });

  it('treats different qualities at the same pitch as different', () => {
    const cSharpMajor: Chord = {
      root: { natural: 'C', accidental: 'sharp' },
      quality: 'major',
    };
    const cSharpMinor: Chord = {
      root: { natural: 'C', accidental: 'sharp' },
      quality: 'minor',
    };
    expect(chordsEqual(cSharpMajor, cSharpMinor)).toBe(false);
  });

  it('treats different roots with the same quality as different', () => {
    const cMajor: Chord = { root: { natural: 'C' }, quality: 'major' };
    const dMajor: Chord = { root: { natural: 'D' }, quality: 'major' };
    expect(chordsEqual(cMajor, dMajor)).toBe(false);
  });
});
