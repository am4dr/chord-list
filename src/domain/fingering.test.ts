import { describe, expect, it } from 'vitest';
import type { Chord } from './chord';
import { getFingering, getFingeringCandidates } from './fingering';
import { FINGERINGS } from './fingerings.data';

describe('getFingering', () => {
  it('returns the open C major shape', () => {
    const c: Chord = { root: { natural: 'C' }, quality: 'major' };
    expect(getFingering(c)?.frets).toEqual([null, 3, 2, 0, 1, 0]);
  });

  it('returns the open A minor shape', () => {
    const am: Chord = { root: { natural: 'A' }, quality: 'minor' };
    expect(getFingering(am)?.frets).toEqual([null, 0, 2, 2, 1, 0]);
  });

  it('returns the open E minor shape', () => {
    const em: Chord = { root: { natural: 'E' }, quality: 'minor' };
    expect(getFingering(em)?.frets).toEqual([0, 2, 2, 0, 0, 0]);
  });

  it('returns the same fingering for enharmonic roots', () => {
    const cSharp: Chord = {
      root: { natural: 'C', accidental: 'sharp' },
      quality: 'major',
    };
    const dFlat: Chord = {
      root: { natural: 'D', accidental: 'flat' },
      quality: 'major',
    };
    expect(getFingering(dFlat)).toEqual(getFingering(cSharp));
  });

  it('returns null for an unsupported quality', () => {
    const cDim = { root: { natural: 'C' }, quality: 'major' as const };
    // Force-cast to simulate a chord that is not in the data table.
    const unsupported = { ...cDim, quality: 'diminished' } as unknown as Chord;
    expect(getFingering(unsupported)).toBeNull();
  });

  it('returns the expected open shape for Em7', () => {
    const em7: Chord = { root: { natural: 'E' }, quality: 'm7' };
    expect(getFingering(em7)?.frets).toEqual([0, 2, 0, 0, 0, 0]);
  });

  it('returns the expected open shape for Am7', () => {
    const am7: Chord = { root: { natural: 'A' }, quality: 'm7' };
    expect(getFingering(am7)?.frets).toEqual([null, 0, 2, 0, 1, 0]);
  });

  it('returns an E-shape voicing for Cm9 (E-shape forced)', () => {
    const cm9: Chord = { root: { natural: 'C' }, quality: 'm9' };
    // E-shape m9 = [0, 2, 0, 0, 0, 2] shifted by 8 (C is 8 semitones above E)
    expect(getFingering(cm9)?.frets).toEqual([8, 10, 8, 8, 8, 10]);
  });

  it('returns the expected open shape for Asus4', () => {
    const asus4: Chord = { root: { natural: 'A' }, quality: 'sus4' };
    expect(getFingering(asus4)?.frets).toEqual([null, 0, 2, 2, 3, 0]);
  });
});

describe('getFingeringCandidates', () => {
  it('returns the open shape first, followed by barre voicings, for C major', () => {
    const c: Chord = { root: { natural: 'C' }, quality: 'major' };
    const candidates = getFingeringCandidates(c);
    expect(candidates).toHaveLength(3);
    expect(candidates[0].frets).toEqual([null, 3, 2, 0, 1, 0]); // open C
    // The remaining two are E-shape barre at fret 8 and A-shape barre at fret 3.
    const remaining = candidates.slice(1).map((f) => f.frets);
    expect(remaining).toContainEqual([8, 10, 10, 9, 8, 8]);
    expect(remaining).toContainEqual([null, 3, 5, 5, 5, 3]);
  });

  it('deduplicates when the open shape coincides with a barre pattern (E major)', () => {
    const e: Chord = { root: { natural: 'E' }, quality: 'major' };
    const candidates = getFingeringCandidates(e);
    expect(candidates).toHaveLength(2);
    expect(candidates[0].frets).toEqual([0, 2, 2, 1, 0, 0]); // open E (== E-shape at offset 0)
    expect(candidates[1].frets).toEqual([null, 7, 9, 9, 9, 7]); // A-shape barre
  });

  it('returns a single E-shape voicing for m9 chords (A-shape suppressed)', () => {
    const cm9: Chord = { root: { natural: 'C' }, quality: 'm9' };
    const candidates = getFingeringCandidates(cm9);
    expect(candidates).toHaveLength(1);
    expect(candidates[0].frets).toEqual([8, 10, 8, 8, 8, 10]);
  });

  it('returns two voicings for sus4 chords (E-shape and A-shape)', () => {
    const csus4: Chord = { root: { natural: 'C' }, quality: 'sus4' };
    const candidates = getFingeringCandidates(csus4);
    expect(candidates).toHaveLength(2);
  });

  it('returns the same candidates for enharmonic roots', () => {
    const cSharp: Chord = { root: { natural: 'C', accidental: 'sharp' }, quality: 'major' };
    const dFlat: Chord = { root: { natural: 'D', accidental: 'flat' }, quality: 'major' };
    expect(getFingeringCandidates(dFlat)).toEqual(getFingeringCandidates(cSharp));
  });
});

describe('FINGERINGS data integrity', () => {
  it('every entry has 6 strings', () => {
    for (const entry of FINGERINGS) {
      expect(entry.fingering.frets).toHaveLength(6);
    }
  });

  it('covers all 12 roots × 8 qualities', () => {
    expect(FINGERINGS).toHaveLength(96);
  });

  it('every fret value is null or a non-negative integer', () => {
    for (const entry of FINGERINGS) {
      for (const fret of entry.fingering.frets) {
        if (fret === null) continue;
        expect(Number.isInteger(fret)).toBe(true);
        expect(fret).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
