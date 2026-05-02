import { useState, type CSSProperties } from 'react';
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
  { value: 'm7', label: 'm7' },
  { value: 'M7', label: 'M7' },
  { value: 'm9', label: 'm9' },
  { value: 'M9', label: 'M9' },
  { value: 'sus4', label: 'sus4' },
  { value: '7sus4', label: '7sus4' },
];

const FIELDSET_ROW: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 16,
};

const OPTIONS: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 12,
};

const OPTION_LABEL: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 4,
};

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
      <div style={FIELDSET_ROW}>
        <fieldset>
          <legend>Root</legend>
          <div style={OPTIONS}>
            {NATURAL_NOTES.map((n) => (
              <label key={n} style={OPTION_LABEL}>
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
          </div>
        </fieldset>

        <fieldset>
          <legend>Accidental</legend>
          <div style={OPTIONS}>
            {ACCIDENTAL_CHOICES.map((a) => (
              <label key={a.value} style={OPTION_LABEL}>
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
          </div>
        </fieldset>
      </div>

      <fieldset>
        <legend>Quality</legend>
        <div style={OPTIONS}>
          {QUALITIES.map((q) => (
            <label key={q.value} style={OPTION_LABEL}>
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
        </div>
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
