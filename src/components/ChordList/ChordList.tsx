import { useState, type CSSProperties, type DragEvent } from 'react';
import { formatChord } from '../../domain/chord';
import type { ChordVoicing } from '../../domain/fingering';
import { ChordDiagram } from '../ChordDiagram/ChordDiagram';
import { CHORD_INDEX_MIME, CHORD_MIME } from '../dnd';

export interface ChordListProps {
  voicings: ReadonlyArray<ChordVoicing>;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onInsert: (voicing: ChordVoicing, index: number) => void;
}

const LIST_STYLE: CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexWrap: 'wrap',
  alignContent: 'flex-start',
  gap: 16,
  minHeight: 150,
  width: '100%',
  boxSizing: 'border-box',
};

const ITEM_STYLE: CSSProperties = {
  textAlign: 'center',
  padding: 4,
  borderRadius: 4,
};

const ITEM_HOVER_STYLE: CSSProperties = {
  ...ITEM_STYLE,
  outline: '2px dashed currentColor',
};

export function ChordList({ voicings, onRemove, onMove, onInsert }: ChordListProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const handleDragStart = (e: DragEvent, index: number) => {
    e.dataTransfer.setData(CHORD_INDEX_MIME, String(index));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: DragEvent, dropIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setHoverIndex(dropIndex);
  };

  const handleDragLeave = () => setHoverIndex(null);

  const handleDrop = (e: DragEvent, dropIndex: number) => {
    e.preventDefault();
    setHoverIndex(null);

    const fromStr = e.dataTransfer.getData(CHORD_INDEX_MIME);
    if (fromStr !== '') {
      const from = parseInt(fromStr, 10);
      if (from !== dropIndex) onMove(from, dropIndex);
      return;
    }

    const voicingJson = e.dataTransfer.getData(CHORD_MIME);
    if (voicingJson) {
      const voicing = JSON.parse(voicingJson) as ChordVoicing;
      onInsert(voicing, dropIndex);
    }
  };

  return (
    <div>
      {voicings.length === 0 && <p data-testid="chord-list-empty">コードを追加してください</p>}
      <ul style={LIST_STYLE}>
        {voicings.map(({ chord, fingering }, index) => {
          const name = formatChord(chord);
          const isFirst = index === 0;
          const isLast = index === voicings.length - 1;
          const style = hoverIndex === index ? ITEM_HOVER_STYLE : ITEM_STYLE;
          return (
            <li
              key={index}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              style={style}
            >
              <div>{name}</div>
              <ChordDiagram fingering={fingering} ariaLabel={name} />
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
    </div>
  );
}
