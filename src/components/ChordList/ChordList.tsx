import { useState, type CSSProperties, type DragEvent } from 'react';
import { formatChord, type Chord } from '../../domain/chord';
import { getFingering } from '../../domain/fingering';
import { ChordDiagram } from '../ChordDiagram/ChordDiagram';
import { CHORD_INDEX_MIME, CHORD_MIME } from '../dnd';

export interface ChordListProps {
  chords: ReadonlyArray<Chord>;
  onRemove: (index: number) => void;
  onMove: (from: number, to: number) => void;
  onInsert: (chord: Chord, index: number) => void;
}

const LIST_STYLE: CSSProperties = {
  listStyle: 'none',
  padding: 0,
  display: 'flex',
  flexWrap: 'wrap',
  gap: 16,
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

const END_ZONE_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 100,
  minHeight: 130,
  border: '2px dashed currentColor',
  borderRadius: 4,
  opacity: 0.5,
};

const END_ZONE_HOVER_STYLE: CSSProperties = {
  ...END_ZONE_STYLE,
  opacity: 1,
};

export function ChordList({ chords, onRemove, onMove, onInsert }: ChordListProps) {
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
      const adjustedTo = from < dropIndex ? dropIndex - 1 : dropIndex;
      if (from !== adjustedTo) onMove(from, adjustedTo);
      return;
    }

    const chordJson = e.dataTransfer.getData(CHORD_MIME);
    if (chordJson) {
      const chord = JSON.parse(chordJson) as Chord;
      onInsert(chord, dropIndex);
    }
  };

  return (
    <div>
      {chords.length === 0 && <p data-testid="chord-list-empty">コードを追加してください</p>}
      <ul style={LIST_STYLE}>
        {chords.map((chord, index) => {
          const name = formatChord(chord);
          const fingering = getFingering(chord);
          const isFirst = index === 0;
          const isLast = index === chords.length - 1;
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
        <li
          data-testid="chord-list-end-zone"
          aria-label="リスト末尾の追加先"
          onDragOver={(e) => handleDragOver(e, chords.length)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, chords.length)}
          style={hoverIndex === chords.length ? END_ZONE_HOVER_STYLE : END_ZONE_STYLE}
        >
          ＋
        </li>
      </ul>
    </div>
  );
}
