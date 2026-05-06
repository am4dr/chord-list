# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this app is

A Web app that helps with guitar playing: pick a chord and it gets added to a list that shows how to fret each chord as an SVG diagram. The product spec lives in `spec.md` (Japanese).

## Commands

```bash
npm run dev              # Vite dev server
npm run build            # tsc -b && vite build (TypeScript project references)
npm run lint             # ESLint over the repo
npm run storybook        # Storybook dev server on :6006
npm run build-storybook  # Static Storybook build

# Tests — Vitest is configured with TWO projects:
npx vitest run --project unit       # jsdom unit tests for src/**/*.{test,spec}.{ts,tsx}
npx vitest run --project storybook  # Playwright/Chromium tests over Storybook stories
npx vitest                          # interactive watch (both projects)

# Run a single test file or by name:
npx vitest run --project unit src/domain/chord.test.ts
npx vitest run --project unit -t "formatChord"
```

`npm run lint` ignores `dist/` and `storybook-static/` (set in `eslint.config.js`). If you run `build-storybook` and then lint, expect ESLint to error on the build output unless that ignore is preserved.

## Architecture

Three layers, with a strict dependency direction (domain ← components ← App):

### `src/domain/` — pure type and lookup logic, no React

- `note.ts` — `Note` (natural + optional accidental) and `toPitchClass`. PitchClass normalizes enharmonics so `C# === Db === 1`.
- `chord.ts` — `Chord` (root Note + Quality), `formatChord`, `chordsEqual`. `chordsEqual` compares pitch class, **not** spelling — passing a `Db major` chord to a function expecting `C# major` works.
- `fingering.ts` + `fingerings.data.ts` — `Fingering` is `{ frets: ReadonlyArray<number | null> }` length 6, low E to high E, `null` = muted. `ChordVoicing` is `{ chord, fingering }` — what the list stores so the user's chosen voicing is preserved.

`Quality` extension pattern: extended qualities (`m7`, `M7`, `m9`, `M9`, `sus4`, `7sus4`) use the display suffix as the type name. `formatChord` falls through `default: return quality` so adding a new short-suffix quality requires no `formatChord` change. `major`/`minor` are special-cased.

`FINGERINGS` is **two arrays concatenated**: hand-crafted major/minor entries first, then generated entries for the extended qualities. `getFingering` does `Array.find` and returns the first match — the hand-crafted entries deliberately take precedence so common open shapes (open C, D, G, etc.) win over a generated barre voicing for the same chord. To override an extended-quality voicing, prepend an entry to `HAND_CRAFTED`.

`getFingeringCandidates(chord)` returns **all** voicings for a chord: every matching FINGERINGS entry first, then E-shape and A-shape barre voicings from `generateBarreCandidates`, deduplicated by fret pattern. ChordSelector renders one candidate card per result so the user can pick which voicing to add.

The generator picks E-shape vs A-shape barre based on which sits lower on the neck, **except for m9/M9 which are pinned to E-shape** because the A-shape m9 voicing requires an unplayable stretch when shifted up. `generateBarreCandidates` returns both shapes (lower-on-neck first), or just the E-shape for m9/M9. `FINGERINGS`' generated entries take only the first (primary) candidate.

### `src/components/` — components live in their own folder with `.tsx`, `.test.tsx`, `.stories.tsx`

- `ChordDiagram` — renders an SVG. Pure: takes a Fingering, returns SVG. Uses `stroke="currentColor"` / `fill="currentColor"` so it inherits theme colors from the parent (the `index.css` `prefers-color-scheme` block sets the parent `color`). The fret window helper (`fretWindow.ts`) decides whether to show the nut or a `Nfr` label.
- `ChordSelector` — three radio fieldsets (root / accidental / quality) + live preview that includes its own `ChordDiagram`. The preview is `draggable` and exports the chord JSON via `dataTransfer`.
- `ChordList` — receives `voicings` and four callbacks (`onRemove`, `onMove`, `onInsert`). Click-based reorder/delete buttons coexist with HTML5 drag-and-drop. Drag-and-drop only inserts before an existing item; appending is done via the selector's 追加 button.
- `SavedLists` — purely controlled. App owns the `Record<name, ChordVoicing[]>` map and passes the three handlers (`onSave`, `onLoad`, `onDelete`). Internal state is just the name input buffer. Save button is gated on `currentCount > 0 && trimmed name`.

### Persistence (`src/utils/storage.ts`)

Two localStorage keys, both wrapped in a `{ version: 1, ... }` envelope so future schema changes can bump the key (`...:v2`) and add migration in the loader without touching call sites.

- `chords:savedLists:v1` — `{ version, lists: Record<string, ChordVoicing[]> }`. Named, user-saved lists.
- `chords:current:v1` — `{ version, voicings: ChordVoicing[] }`. The working list, auto-persisted via a `useEffect` in `App.tsx` so a reload restores in-progress edits.

`loadSavedLists` / `loadCurrentList` never throw: malformed JSON, wrong shape, or wrong version all log to `console.warn` and return an empty value. `putSavedList` / `saveCurrentList` deep-clone voicings (`{...chord, root: {...}}`, `[...frets]`) so storage is decoupled from React state references — later mutations on either side don't leak. `App.tsx` is the single owner of `savedLists` state; `SavedLists` reads it via props. No `storage` event listener — cross-tab sync is intentionally deferred.

Confirmation flows use `window.confirm` for overwrite-on-save, replace-on-load (when the working list is non-empty), and delete. jsdom auto-accepts; tests can override with `vi.spyOn(window, 'confirm').mockReturnValue(...)` if they need to assert the dialog branch.

### Drag-and-drop contract (`src/components/dnd.ts`)

Two MIME-like keys distinguish the two drag sources:

- `CHORD_INDEX_MIME` (`application/x-chord-index`) — payload is a stringified index. Set by ChordList items on dragstart. Drop target interprets this as a **reorder** and calls `onMove`.
- `CHORD_MIME` (`application/x-chord`) — payload is a `ChordVoicing` JSON (`{ chord, fingering }`). Set by ChordSelector candidate cards on dragstart so the dropped voicing matches the card the user grabbed. Drop target interprets this as an **insert** and calls `onInsert(voicing, index)`.

ChordList drop handler checks the index key first; the dragged item is moved to the drop target's index (the target and items past it shift to make room). Implemented as `onMove(from, dropIndex)` with no adjustment: dropping `[1,2,3]`'s 1 on 3 yields `[2,3,1]`.

If you add a third drag source, add a new MIME-like key in `dnd.ts` and a third branch in the drop handler — don't reuse one of the existing keys.

## Testing notes

- Unit tests run in jsdom with `@testing-library/jest-dom/vitest` matchers preloaded via `src/test/setup.ts`.
- Component tests prefer `getByRole('radio', { name })` over `getByLabelText` because some labels (e.g., a chord's name) are now used in multiple places (radio label, SVG `aria-label`, list-item heading) and `getByLabelText` collides.
- The DnD tests construct a mock `dataTransfer` (`Map`-backed `getData`/`setData`) and pass it through `fireEvent.dragStart` / `dragOver` / `drop` — jsdom doesn't ship a usable `DataTransfer`. Reuse the same mock object across the three calls so data persists.
- Stories are excluded from the unit project (`exclude: ['src/**/*.stories.*']`) and run only inside the storybook Vitest project, which spins up Playwright.
