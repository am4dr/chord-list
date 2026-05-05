import { useState, type CSSProperties, type DragEvent } from 'react';
import { formatChord, type Chord, type Quality } from '../../domain/chord';
import { getFingeringCandidates, type ChordVoicing, type Fingering } from '../../domain/fingering';
import type { Accidental, NaturalNote } from '../../domain/note';
import { ChordDiagram } from '../ChordDiagram/ChordDiagram';
import { CHORD_MIME } from '../dnd';

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

const CANDIDATES_ROW: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 16,
  marginTop: 8,
};

const CANDIDATE_CARD: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
  cursor: 'grab',
};

export interface ChordSelectorProps {
  onSubmit: (voicing: ChordVoicing) => void;
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
  const candidates = getFingeringCandidates(chord);

  const handleDragStart = (e: DragEvent, fingering: Fingering) => {
    const voicing: ChordVoicing = { chord, fingering };
    e.dataTransfer.setData(CHORD_MIME, JSON.stringify(voicing));
    e.dataTransfer.effectAllowed = 'copy';
  };

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
        {candidates.length === 0 ? (
          <div data-testid="chord-preview-empty">運指データがありません</div>
        ) : (
          <div style={CANDIDATES_ROW}>
            {candidates.map((fingering, i) => (
              <div
                key={i}
                data-testid="chord-candidate"
                draggable
                onDragStart={(e) => handleDragStart(e, fingering)}
                style={CANDIDATE_CARD}
              >
                <ChordDiagram fingering={fingering} ariaLabel={chordName} />
                <button type="button" onClick={() => onSubmit({ chord, fingering })}>
                  追加
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
