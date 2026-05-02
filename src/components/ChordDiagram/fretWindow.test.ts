import { describe, expect, it } from 'vitest';
import { getFretWindow } from './fretWindow';

describe('getFretWindow', () => {
  it('starts at fret 1 with the nut for open chords', () => {
    expect(getFretWindow([null, 3, 2, 0, 1, 0])).toEqual({ start: 1, showNut: true });
  });

  it('starts at fret 1 with the nut for E minor (all open)', () => {
    expect(getFretWindow([0, 2, 2, 0, 0, 0])).toEqual({ start: 1, showNut: true });
  });

  it('starts at the lowest pressed fret when the chord sits above fret 4', () => {
    expect(getFretWindow([null, 4, 6, 6, 6, 4])).toEqual({ start: 4, showNut: false });
    expect(getFretWindow([null, 6, 8, 8, 7, 6])).toEqual({ start: 6, showNut: false });
  });

  it('keeps the nut when max fret equals 4', () => {
    expect(getFretWindow([null, 4, 4, 4, 4, 4])).toEqual({ start: 1, showNut: true });
  });

  it('falls back to the open window when there are no pressed frets', () => {
    expect(getFretWindow([null, null, 0, 0, 0, 0])).toEqual({ start: 1, showNut: true });
  });
});
