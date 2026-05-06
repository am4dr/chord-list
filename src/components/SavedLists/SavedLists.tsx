import {
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
} from 'react';
import type { ChordVoicing } from '../../domain/fingering';

export interface SavedListsProps {
  savedLists: Record<string, ReadonlyArray<ChordVoicing>>;
  currentCount: number;
  onSave: (name: string) => void;
  onLoad: (name: string) => void;
  onDelete: (name: string) => void;
}

const TRIGGER_WRAPPER: CSSProperties = {
  width: '100%',
  display: 'flex',
  justifyContent: 'flex-end',
  marginBottom: 8,
};

const TRIGGER_STYLE: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 36,
  height: 36,
  padding: 0,
  background: 'transparent',
  border: '1px solid currentColor',
  borderRadius: 4,
  cursor: 'pointer',
  color: 'inherit',
};

const DIALOG_STYLE: CSSProperties = {
  width: 'min(560px, 90vw)',
  maxWidth: '90vw',
  border: 'none',
  borderRadius: 8,
  padding: 0,
  boxSizing: 'border-box',
};

const DIALOG_INNER: CSSProperties = {
  padding: 20,
  boxSizing: 'border-box',
  textAlign: 'left',
};

const DIALOG_HEADER: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 8,
  marginBottom: 16,
};

const DIALOG_TITLE: CSSProperties = {
  margin: 0,
  fontSize: '1.2em',
};

const CLOSE_BTN: CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  fontSize: '1.4em',
  lineHeight: 1,
  padding: '4px 8px',
  color: 'inherit',
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
  maxHeight: 320,
  overflowY: 'auto',
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

function ListIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

export function SavedLists({
  savedLists,
  currentCount,
  onSave,
  onLoad,
  onDelete,
}: SavedListsProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState('');
  const trimmed = name.trim();
  const canSave = currentCount > 0 && trimmed !== '';
  const sortedNames = Object.keys(savedLists).sort((a, b) => a.localeCompare(b));

  const openDialog = () => dialogRef.current?.showModal();
  const closeDialog = () => dialogRef.current?.close();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSave) return;
    onSave(trimmed);
    setName('');
  };

  const handleBackdropClick = (e: ReactMouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) closeDialog();
  };

  return (
    <>
      <div style={TRIGGER_WRAPPER}>
        <button
          type="button"
          aria-label="保存したリストを表示"
          onClick={openDialog}
          style={TRIGGER_STYLE}
        >
          <ListIcon />
        </button>
      </div>
      <dialog ref={dialogRef} style={DIALOG_STYLE} onClick={handleBackdropClick}>
        <div style={DIALOG_INNER}>
          <div style={DIALOG_HEADER}>
            <h2 style={DIALOG_TITLE}>保存したリスト</h2>
            <button
              type="button"
              onClick={closeDialog}
              aria-label="閉じる"
              style={CLOSE_BTN}
            >
              ×
            </button>
          </div>
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
        </div>
      </dialog>
    </>
  );
}
