import { render, screen } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { ChordVoicing } from '../../domain/fingering';
import { SavedLists } from './SavedLists';

// jsdom v29 ships HTMLDialogElement but its showModal/close implementations
// only flip the open attribute. Polyfill defensively in case a future jsdom
// version drops them or throws. Idempotent.
beforeAll(() => {
  if (!HTMLDialogElement.prototype.showModal) {
    HTMLDialogElement.prototype.showModal = function showModal() {
      this.setAttribute('open', '');
    };
  }
  if (!HTMLDialogElement.prototype.close) {
    HTMLDialogElement.prototype.close = function close() {
      this.removeAttribute('open');
    };
  }
});

const cMajor: ChordVoicing = {
  chord: { root: { natural: 'C' }, quality: 'major' },
  fingering: { frets: [null, 3, 2, 0, 1, 0] },
};

const aMinor: ChordVoicing = {
  chord: { root: { natural: 'A' }, quality: 'minor' },
  fingering: { frets: [null, 0, 2, 2, 1, 0] },
};

const noop = () => {};

const openPopup = async (user: UserEvent) => {
  await user.click(screen.getByRole('button', { name: '保存したリストを表示' }));
};

describe('SavedLists', () => {
  it('renders a trigger button and starts with the dialog closed', () => {
    render(
      <SavedLists
        savedLists={{}}
        currentCount={0}
        onSave={noop}
        onLoad={noop}
        onDelete={noop}
      />,
    );
    expect(
      screen.getByRole('button', { name: '保存したリストを表示' }),
    ).toBeInTheDocument();
    const dialog = document.querySelector('dialog');
    expect(dialog).not.toBeNull();
    expect(dialog!.hasAttribute('open')).toBe(false);
  });

  it('opens the dialog when the trigger is clicked and closes via the close button', async () => {
    const user = userEvent.setup();
    render(
      <SavedLists
        savedLists={{}}
        currentCount={0}
        onSave={noop}
        onLoad={noop}
        onDelete={noop}
      />,
    );
    await openPopup(user);
    expect(document.querySelector('dialog')!.hasAttribute('open')).toBe(true);
    await user.click(screen.getByRole('button', { name: '閉じる' }));
    expect(document.querySelector('dialog')!.hasAttribute('open')).toBe(false);
  });

  it('shows the empty state when no lists are saved', async () => {
    const user = userEvent.setup();
    render(
      <SavedLists
        savedLists={{}}
        currentCount={0}
        onSave={noop}
        onLoad={noop}
        onDelete={noop}
      />,
    );
    await openPopup(user);
    expect(screen.getByTestId('saved-lists-empty')).toBeInTheDocument();
  });

  it('renders entries sorted alphabetically with chord counts', async () => {
    const user = userEvent.setup();
    render(
      <SavedLists
        savedLists={{ banana: [cMajor], apple: [cMajor, aMinor] }}
        currentCount={0}
        onSave={noop}
        onLoad={noop}
        onDelete={noop}
      />,
    );
    await openPopup(user);
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('apple');
    expect(items[0]).toHaveTextContent('(2 コード)');
    expect(items[1]).toHaveTextContent('banana');
    expect(items[1]).toHaveTextContent('(1 コード)');
  });

  it('disables save when there are no chords in the current list', async () => {
    const user = userEvent.setup();
    render(
      <SavedLists
        savedLists={{}}
        currentCount={0}
        onSave={noop}
        onLoad={noop}
        onDelete={noop}
      />,
    );
    await openPopup(user);
    expect(screen.getByRole('button', { name: '保存' })).toBeDisabled();
  });

  it('disables save when the name is empty or whitespace', async () => {
    const user = userEvent.setup();
    render(
      <SavedLists
        savedLists={{}}
        currentCount={3}
        onSave={noop}
        onLoad={noop}
        onDelete={noop}
      />,
    );
    await openPopup(user);
    expect(screen.getByRole('button', { name: '保存' })).toBeDisabled();
    await user.type(screen.getByRole('textbox', { name: 'リスト名' }), '   ');
    expect(screen.getByRole('button', { name: '保存' })).toBeDisabled();
  });

  it('calls onSave with the trimmed name and clears the input', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <SavedLists
        savedLists={{}}
        currentCount={3}
        onSave={onSave}
        onLoad={noop}
        onDelete={noop}
      />,
    );
    await openPopup(user);
    const input = screen.getByRole('textbox', { name: 'リスト名' });
    await user.type(input, '  intro  ');
    await user.click(screen.getByRole('button', { name: '保存' }));
    expect(onSave).toHaveBeenCalledWith('intro');
    expect(input).toHaveValue('');
  });

  it('submits via Enter key', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(
      <SavedLists
        savedLists={{}}
        currentCount={3}
        onSave={onSave}
        onLoad={noop}
        onDelete={noop}
      />,
    );
    await openPopup(user);
    const input = screen.getByRole('textbox', { name: 'リスト名' });
    await user.type(input, 'verse{Enter}');
    expect(onSave).toHaveBeenCalledWith('verse');
  });

  it('calls onLoad when the load button is clicked', async () => {
    const user = userEvent.setup();
    const onLoad = vi.fn();
    render(
      <SavedLists
        savedLists={{ intro: [cMajor] }}
        currentCount={0}
        onSave={noop}
        onLoad={onLoad}
        onDelete={noop}
      />,
    );
    await openPopup(user);
    await user.click(screen.getByRole('button', { name: '読み込み' }));
    expect(onLoad).toHaveBeenCalledWith('intro');
  });

  it('calls onDelete when the delete button is clicked', async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn();
    render(
      <SavedLists
        savedLists={{ intro: [cMajor] }}
        currentCount={0}
        onSave={noop}
        onLoad={noop}
        onDelete={onDelete}
      />,
    );
    await openPopup(user);
    await user.click(screen.getByRole('button', { name: 'intro を削除' }));
    expect(onDelete).toHaveBeenCalledWith('intro');
  });
});
