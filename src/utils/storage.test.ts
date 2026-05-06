import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ChordVoicing } from '../domain/fingering';
import {
  CURRENT_LIST_KEY,
  SAVED_LISTS_KEY,
  deleteSavedList,
  loadCurrentList,
  loadSavedLists,
  putSavedList,
  saveCurrentList,
  saveSavedLists,
} from './storage';

const cMajor: ChordVoicing = {
  chord: { root: { natural: 'C' }, quality: 'major' },
  fingering: { frets: [null, 3, 2, 0, 1, 0] },
};

const aMinor: ChordVoicing = {
  chord: { root: { natural: 'A' }, quality: 'minor' },
  fingering: { frets: [null, 0, 2, 2, 1, 0] },
};

beforeEach(() => {
  localStorage.clear();
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

describe('loadSavedLists', () => {
  it('returns an empty object when nothing is stored', () => {
    expect(loadSavedLists()).toEqual({});
  });

  it('returns an empty object on malformed JSON', () => {
    localStorage.setItem(SAVED_LISTS_KEY, '{not json');
    expect(loadSavedLists()).toEqual({});
  });

  it('returns an empty object on wrong shape', () => {
    localStorage.setItem(SAVED_LISTS_KEY, JSON.stringify({ foo: 'bar' }));
    expect(loadSavedLists()).toEqual({});
  });

  it('returns an empty object on wrong version', () => {
    localStorage.setItem(
      SAVED_LISTS_KEY,
      JSON.stringify({ version: 2, lists: { a: [] } }),
    );
    expect(loadSavedLists()).toEqual({});
  });

  it('round-trips a saved file', () => {
    saveSavedLists({ progression: [cMajor, aMinor] });
    const loaded = loadSavedLists();
    expect(loaded).toEqual({ progression: [cMajor, aMinor] });
  });

  it('skips entries that do not look like voicing arrays', () => {
    localStorage.setItem(
      SAVED_LISTS_KEY,
      JSON.stringify({ version: 1, lists: { ok: [cMajor], bad: 'oops' } }),
    );
    expect(loadSavedLists()).toEqual({ ok: [cMajor] });
  });
});

describe('putSavedList', () => {
  it('writes a v1 envelope', () => {
    putSavedList('intro', [cMajor]);
    const raw = localStorage.getItem(SAVED_LISTS_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toEqual({ version: 1, lists: { intro: [cMajor] } });
  });

  it('overwrites an existing entry', () => {
    putSavedList('intro', [cMajor]);
    const next = putSavedList('intro', [aMinor]);
    expect(next).toEqual({ intro: [aMinor] });
  });

  it('preserves other entries', () => {
    putSavedList('a', [cMajor]);
    const next = putSavedList('b', [aMinor]);
    expect(next).toEqual({ a: [cMajor], b: [aMinor] });
  });

  it('throws on an empty name', () => {
    expect(() => putSavedList('', [cMajor])).toThrow();
    expect(() => putSavedList('   ', [cMajor])).toThrow();
  });

  it('trims whitespace around the name', () => {
    const next = putSavedList('  hello  ', [cMajor]);
    expect(Object.keys(next)).toEqual(['hello']);
  });

  it('deep-clones voicings so later mutations do not leak into storage', () => {
    const mutableFrets: (number | null)[] = [null, 3, 2, 0, 1, 0];
    const voicing: ChordVoicing = {
      chord: { root: { natural: 'C' }, quality: 'major' },
      fingering: { frets: mutableFrets },
    };
    putSavedList('snapshot', [voicing]);
    mutableFrets.push(99);
    expect(loadSavedLists().snapshot[0].fingering.frets).toHaveLength(6);
  });
});

describe('deleteSavedList', () => {
  it('removes the named entry', () => {
    putSavedList('a', [cMajor]);
    putSavedList('b', [aMinor]);
    const next = deleteSavedList('a');
    expect(next).toEqual({ b: [aMinor] });
    expect(loadSavedLists()).toEqual({ b: [aMinor] });
  });

  it('is a no-op when the name is missing', () => {
    putSavedList('a', [cMajor]);
    const next = deleteSavedList('nonexistent');
    expect(next).toEqual({ a: [cMajor] });
  });
});

describe('current list', () => {
  it('returns an empty array when nothing is stored', () => {
    expect(loadCurrentList()).toEqual([]);
  });

  it('round-trips voicings', () => {
    saveCurrentList([cMajor, aMinor]);
    expect(loadCurrentList()).toEqual([cMajor, aMinor]);
  });

  it('writes a v1 envelope', () => {
    saveCurrentList([cMajor]);
    const raw = localStorage.getItem(CURRENT_LIST_KEY);
    expect(JSON.parse(raw!)).toEqual({ version: 1, voicings: [cMajor] });
  });

  it('returns an empty array on wrong version', () => {
    localStorage.setItem(
      CURRENT_LIST_KEY,
      JSON.stringify({ version: 2, voicings: [cMajor] }),
    );
    expect(loadCurrentList()).toEqual([]);
  });

  it('returns an empty array on malformed JSON', () => {
    localStorage.setItem(CURRENT_LIST_KEY, '{');
    expect(loadCurrentList()).toEqual([]);
  });
});
