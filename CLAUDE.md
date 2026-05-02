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
- `fingering.ts` + `fingerings.data.ts` — `Fingering` is `{ frets: ReadonlyArray<number | null> }` length 6, low E to high E, `null` = muted.

`Quality` extension pattern: extended qualities (`m7`, `M7`, `m9`, `M9`, `sus4`, `7sus4`) use the display suffix as the type name. `formatChord` falls through `default: return quality` so adding a new short-suffix quality requires no `formatChord` change. `major`/`minor` are special-cased.

`FINGERINGS` is **two arrays concatenated**: hand-crafted major/minor entries first, then generated entries for the extended qualities. `getFingering` does `Array.find` and returns the first match — the hand-crafted entries deliberately take precedence so common open shapes (open C, D, G, etc.) win over a generated barre voicing for the same chord. To override an extended-quality voicing, prepend an entry to `HAND_CRAFTED`.

The generator picks E-shape vs A-shape barre based on which sits lower on the neck, **except for m9/M9 which are pinned to E-shape** because the A-shape m9 voicing requires an unplayable stretch when shifted up.

### `src/components/` — three components, each in its own folder with `.tsx`, `.test.tsx`, `.stories.tsx`

- `ChordDiagram` — renders an SVG. Pure: takes a Fingering, returns SVG. Uses `stroke="currentColor"` / `fill="currentColor"` so it inherits theme colors from the parent (the `index.css` `prefers-color-scheme` block sets the parent `color`). The fret window helper (`fretWindow.ts`) decides whether to show the nut or a `Nfr` label.
- `ChordSelector` — three radio fieldsets (root / accidental / quality) + live preview that includes its own `ChordDiagram`. The preview is `draggable` and exports the chord JSON via `dataTransfer`.
- `ChordList` — receives `chords` and four callbacks (`onRemove`, `onMove`, `onInsert`). Click-based reorder/delete buttons coexist with HTML5 drag-and-drop. Always renders an end-of-list drop zone (`data-testid="chord-list-end-zone"`) for appending.

### Drag-and-drop contract (`src/components/dnd.ts`)

Two MIME-like keys distinguish the two drag sources:

- `CHORD_INDEX_MIME` (`application/x-chord-index`) — payload is a stringified index. Set by ChordList items on dragstart. Drop target interprets this as a **reorder** and calls `onMove`.
- `CHORD_MIME` (`application/x-chord`) — payload is a `Chord` JSON. Set by ChordSelector preview on dragstart. Drop target interprets this as an **insert** and calls `onInsert`.

ChordList drop handler checks the index key first; either case lands the dragged item at the visual position of the drop target via the standard "insert before target" formula: `from < dropIndex ? dropIndex - 1 : dropIndex`. The end zone uses `dropIndex = chords.length`.

If you add a third drag source, add a new MIME-like key in `dnd.ts` and a third branch in the drop handler — don't reuse one of the existing keys.

## Testing notes

- Unit tests run in jsdom with `@testing-library/jest-dom/vitest` matchers preloaded via `src/test/setup.ts`.
- Component tests prefer `getByRole('radio', { name })` over `getByLabelText` because some labels (e.g., a chord's name) are now used in multiple places (radio label, SVG `aria-label`, list-item heading) and `getByLabelText` collides.
- The DnD tests construct a mock `dataTransfer` (`Map`-backed `getData`/`setData`) and pass it through `fireEvent.dragStart` / `dragOver` / `drop` — jsdom doesn't ship a usable `DataTransfer`. Reuse the same mock object across the three calls so data persists.
- Stories are excluded from the unit project (`exclude: ['src/**/*.stories.*']`) and run only inside the storybook Vitest project, which spins up Playwright.
