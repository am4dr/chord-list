import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { ChordVoicing } from '../../domain/fingering';
import { SavedLists } from './SavedLists';

const cMajor: ChordVoicing = {
  chord: { root: { natural: 'C' }, quality: 'major' },
  fingering: { frets: [null, 3, 2, 0, 1, 0] },
};

const aMinor: ChordVoicing = {
  chord: { root: { natural: 'A' }, quality: 'minor' },
  fingering: { frets: [null, 0, 2, 2, 1, 0] },
};

const noop = () => {};

describe('SavedLists', () => {
  it('shows the empty state when no lists are saved', () => {
    render(
      <SavedLists
        savedLists={{}}
        currentCount={0}
        onSave={noop}
        onLoad={noop}
        onDelete={noop}
      />,
    );
    expect(screen.getByTestId('saved-lists-empty')).toBeInTheDocument();
  });

  it('renders entries sorted alphabetically with chord counts', () => {
    render(
      <SavedLists
        savedLists={{ banana: [cMajor], apple: [cMajor, aMinor] }}
        currentCount={0}
        onSave={noop}
        onLoad={noop}
        onDelete={noop}
      />,
    );
    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('apple');
    expect(items[0]).toHaveTextContent('(2 コード)');
    expect(items[1]).toHaveTextContent('banana');
    expect(items[1]).toHaveTextContent('(1 コード)');
  });

  it('disables save when there are no chords in the current list', () => {
    render(
      <SavedLists
        savedLists={{}}
        currentCount={0}
        onSave={noop}
        onLoad={noop}
        onDelete={noop}
      />,
    );
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
    await user.click(screen.getByRole('button', { name: 'intro を削除' }));
    expect(onDelete).toHaveBeenCalledWith('intro');
  });
});
