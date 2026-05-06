import type { ChordVoicing } from '../domain/fingering';

export const SAVED_LISTS_KEY = 'chords:savedLists:v1';
export const CURRENT_LIST_KEY = 'chords:current:v1';

interface SavedListsFile {
  version: 1;
  lists: Record<string, ChordVoicing[]>;
}

interface CurrentListFile {
  version: 1;
  voicings: ChordVoicing[];
}

function isVoicingArray(value: unknown): value is ChordVoicing[] {
  if (!Array.isArray(value)) return false;
  return value.every(
    (v) =>
      v != null &&
      typeof v === 'object' &&
      'chord' in v &&
      'fingering' in v &&
      v.fingering != null &&
      typeof v.fingering === 'object' &&
      Array.isArray((v.fingering as { frets: unknown }).frets),
  );
}

function cloneVoicing(v: ChordVoicing): ChordVoicing {
  return {
    chord: { ...v.chord, root: { ...v.chord.root } },
    fingering: { frets: [...v.fingering.frets] },
  };
}

export function loadSavedLists(): Record<string, ChordVoicing[]> {
  const raw = localStorage.getItem(SAVED_LISTS_KEY);
  if (raw === null) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed == null ||
      typeof parsed !== 'object' ||
      (parsed as { version?: unknown }).version !== 1 ||
      typeof (parsed as { lists?: unknown }).lists !== 'object' ||
      (parsed as { lists: unknown }).lists == null
    ) {
      console.warn('[storage] saved lists envelope invalid, ignoring');
      return {};
    }
    const lists = (parsed as SavedListsFile).lists;
    const result: Record<string, ChordVoicing[]> = {};
    for (const [name, voicings] of Object.entries(lists)) {
      if (isVoicingArray(voicings)) {
        result[name] = voicings.map(cloneVoicing);
      }
    }
    return result;
  } catch (err) {
    console.warn('[storage] failed to parse saved lists, ignoring', err);
    return {};
  }
}

export function saveSavedLists(lists: Record<string, ChordVoicing[]>): boolean {
  const file: SavedListsFile = { version: 1, lists };
  try {
    localStorage.setItem(SAVED_LISTS_KEY, JSON.stringify(file));
    return true;
  } catch (err) {
    console.warn('[storage] failed to write saved lists', err);
    return false;
  }
}

export function putSavedList(
  name: string,
  voicings: ReadonlyArray<ChordVoicing>,
): Record<string, ChordVoicing[]> {
  const trimmed = name.trim();
  if (trimmed === '') {
    throw new Error('saved list name must not be empty');
  }
  const current = loadSavedLists();
  const next = { ...current, [trimmed]: voicings.map(cloneVoicing) };
  saveSavedLists(next);
  return next;
}

export function deleteSavedList(name: string): Record<string, ChordVoicing[]> {
  const current = loadSavedLists();
  if (!(name in current)) return current;
  const next = { ...current };
  delete next[name];
  saveSavedLists(next);
  return next;
}

export function loadCurrentList(): ChordVoicing[] {
  const raw = localStorage.getItem(CURRENT_LIST_KEY);
  if (raw === null) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed == null ||
      typeof parsed !== 'object' ||
      (parsed as { version?: unknown }).version !== 1 ||
      !isVoicingArray((parsed as { voicings?: unknown }).voicings)
    ) {
      console.warn('[storage] current list envelope invalid, ignoring');
      return [];
    }
    return (parsed as CurrentListFile).voicings.map(cloneVoicing);
  } catch (err) {
    console.warn('[storage] failed to parse current list, ignoring', err);
    return [];
  }
}

export function saveCurrentList(voicings: ReadonlyArray<ChordVoicing>): void {
  const file: CurrentListFile = { version: 1, voicings: voicings.map(cloneVoicing) };
  try {
    localStorage.setItem(CURRENT_LIST_KEY, JSON.stringify(file));
  } catch (err) {
    console.warn('[storage] failed to write current list', err);
  }
}
