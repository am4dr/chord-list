import { useState, type CSSProperties, type FormEvent } from 'react';
import type { ChordVoicing } from '../../domain/fingering';

export interface SavedListsProps {
  savedLists: Record<string, ReadonlyArray<ChordVoicing>>;
  currentCount: number;
  onSave: (name: string) => void;
  onLoad: (name: string) => void;
  onDelete: (name: string) => void;
}

const SECTION_STYLE: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
};

const FORM_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  alignItems: 'center',
  marginBottom: 12,
};

const INPUT_WRAPPER: CSSProperties = {
  flex: '1 1 200px',
  minWidth: 0,
};

const INPUT_STYLE: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
};

const LIST_STYLE: CSSProperties = {
  listStyle: 'none',
  padding: 0,
  margin: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 8,
  width: '100%',
  boxSizing: 'border-box',
};

const ITEM_STYLE: CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 8,
  alignItems: 'center',
  padding: '4px 8px',
  border: '1px solid currentColor',
  borderRadius: 4,
  width: '100%',
  boxSizing: 'border-box',
};

const NAME_STYLE: CSSProperties = {
  flex: '1 1 0',
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  textAlign: 'left',
};

const COUNT_STYLE: CSSProperties = {
  flex: '0 0 auto',
  opacity: 0.7,
  fontSize: '0.9em',
};

export function SavedLists({
  savedLists,
  currentCount,
  onSave,
  onLoad,
  onDelete,
}: SavedListsProps) {
  const [name, setName] = useState('');
  const trimmed = name.trim();
  const canSave = currentCount > 0 && trimmed !== '';
  const sortedNames = Object.keys(savedLists).sort((a, b) => a.localeCompare(b));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    onSave(trimmed);
    setName('');
  };

  return (
    <section style={SECTION_STYLE} aria-labelledby="saved-lists-heading">
      <h2 id="saved-lists-heading" style={{ margin: '0 0 8px' }}>
        保存したリスト
      </h2>
      <form style={FORM_STYLE} onSubmit={handleSubmit}>
        <span style={INPUT_WRAPPER}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="リスト名"
            aria-label="リスト名"
            style={INPUT_STYLE}
          />
        </span>
        <button type="submit" disabled={!canSave}>
          保存
        </button>
      </form>

      {sortedNames.length === 0 ? (
        <p data-testid="saved-lists-empty">保存されたリストはありません</p>
      ) : (
        <ul style={LIST_STYLE}>
          {sortedNames.map((entryName) => {
            const count = savedLists[entryName].length;
            return (
              <li key={entryName} style={ITEM_STYLE}>
                <span style={NAME_STYLE} title={entryName}>
                  {entryName}
                </span>
                <span style={COUNT_STYLE}>({count} コード)</span>
                <button type="button" onClick={() => onLoad(entryName)}>
                  読み込み
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(entryName)}
                  aria-label={`${entryName} を削除`}
                >
                  削除
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
