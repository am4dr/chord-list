import { formatChord, type Chord } from '../../domain/chord';
import { getFingering } from '../../domain/fingering';
import { ChordDiagram } from '../ChordDiagram/ChordDiagram';

export interface ChordListProps {
  chords: ReadonlyArray<Chord>;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
}

export function ChordList({ chords, onRemove, onMove }: ChordListProps) {
  if (chords.length === 0) {
    return <p data-testid="chord-list-empty">コードを追加してください</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexWrap: 'wrap', gap: 16 }}>
      {chords.map((chord, index) => {
        const name = formatChord(chord);
        const fingering = getFingering(chord);
        const isFirst = index === 0;
        const isLast = index === chords.length - 1;
        return (
          <li key={index} style={{ textAlign: 'center' }}>
            <div>{name}</div>
            {fingering && <ChordDiagram fingering={fingering} ariaLabel={name} />}
            <div style={{ display: 'flex', gap: 4, justifyContent: 'center', marginTop: 4 }}>
              <button
                type="button"
                onClick={() => onMove(index, index - 1)}
                disabled={isFirst}
                aria-label={`${name} を前へ`}
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => onMove(index, index + 1)}
                disabled={isLast}
                aria-label={`${name} を後ろへ`}
              >
                →
              </button>
              <button
                type="button"
                onClick={() => onRemove(index)}
                aria-label={`${name} を削除`}
              >
                ×
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
