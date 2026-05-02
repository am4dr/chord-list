import { useState } from 'react';
import { formatChord, type Chord, type Quality } from '../../domain/chord';
import { getFingering } from '../../domain/fingering';
import type { Accidental, NaturalNote } from '../../domain/note';
import { ChordDiagram } from '../ChordDiagram/ChordDiagram';

const NATURAL_NOTES: ReadonlyArray<NaturalNote> = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

type AccidentalChoice = Accidental | 'natural';
const ACCIDENTAL_CHOICES: ReadonlyArray<{ value: AccidentalChoice; label: string }> = [
  { value: 'flat', label: '♭' },
  { value: 'natural', label: '♮' },
  { value: 'sharp', label: '♯' },
];

const QUALITIES: ReadonlyArray<{ value: Quality; label: string }> = [
  { value: 'major', label: 'Major' },
  { value: 'minor', label: 'Minor' },
];

export interface ChordSelectorProps {
  onSubmit: (chord: Chord) => void;
}

export function ChordSelector({ onSubmit }: ChordSelectorProps) {
  const [natural, setNatural] = useState<NaturalNote>('C');
  const [accidental, setAccidental] = useState<AccidentalChoice>('natural');
  const [quality, setQuality] = useState<Quality>('major');

  const chord: Chord = {
    root: {
      natural,
      ...(accidental !== 'natural' ? { accidental } : {}),
    },
    quality,
  };
  const chordName = formatChord(chord);
  const fingering = getFingering(chord);

  return (
    <div>
      <fieldset>
        <legend>Root</legend>
        {NATURAL_NOTES.map((n) => (
          <label key={n}>
            <input
              type="radio"
              name="chord-selector-root"
              value={n}
              checked={natural === n}
              onChange={() => setNatural(n)}
            />
            {n}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Accidental</legend>
        {ACCIDENTAL_CHOICES.map((a) => (
          <label key={a.value}>
            <input
              type="radio"
              name="chord-selector-accidental"
              value={a.value}
              checked={accidental === a.value}
              onChange={() => setAccidental(a.value)}
            />
            {a.label}
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Quality</legend>
        {QUALITIES.map((q) => (
          <label key={q.value}>
            <input
              type="radio"
              name="chord-selector-quality"
              value={q.value}
              checked={quality === q.value}
              onChange={() => setQuality(q.value)}
            />
            {q.label}
          </label>
        ))}
      </fieldset>

      <div aria-live="polite" data-testid="chord-preview">
        <div>{chordName}</div>
        {fingering && <ChordDiagram fingering={fingering} ariaLabel={chordName} />}
      </div>

      <button type="button" onClick={() => onSubmit(chord)}>
        追加
      </button>
    </div>
  );
}
