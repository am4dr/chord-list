import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Chord } from '../../domain/chord';
import { CHORD_INDEX_MIME, CHORD_MIME } from '../dnd';
import { ChordList } from './ChordList';

const cMajor: Chord = { root: { natural: 'C' }, quality: 'major' };
const aMinor: Chord = { root: { natural: 'A' }, quality: 'minor' };
const fMajor: Chord = { root: { natural: 'F' }, quality: 'major' };
const gMajor: Chord = { root: { natural: 'G' }, quality: 'major' };

const noop = () => {};

function makeDataTransfer(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getData: (type: string) => data.get(type) ?? '',
    setData: (type: string, value: string) => {
      data.set(type, value);
    },
    effectAllowed: 'all' as DataTransfer['effectAllowed'],
    dropEffect: 'none' as DataTransfer['dropEffect'],
  };
}

describe('ChordList', () => {
  it('shows an empty state when no chords are present', () => {
    render(<ChordList chords={[]} onRemove={noop} onMove={noop} onInsert={noop} />);
    expect(screen.getByTestId('chord-list-empty')).toBeInTheDocument();
  });

  it('renders one chord diagram per chord', () => {
    render(
      <ChordList chords={[cMajor, aMinor, fMajor]} onRemove={noop} onMove={noop} onInsert={noop} />,
    );
    expect(screen.getAllByRole('img')).toHaveLength(3);
  });

  it('shows the formatted chord name for each entry', () => {
    render(
      <ChordList chords={[cMajor, aMinor, fMajor]} onRemove={noop} onMove={noop} onInsert={noop} />,
    );
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('Am')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
  });

  it('renders a chord diagram with the chord name as aria-label', () => {
    render(<ChordList chords={[cMajor]} onRemove={noop} onMove={noop} onInsert={noop} />);
    expect(screen.getByRole('img', { name: 'C' })).toBeInTheDocument();
  });

  it('disables move-back on the first item and move-forward on the last', () => {
    render(
      <ChordList chords={[cMajor, aMinor, fMajor]} onRemove={noop} onMove={noop} onInsert={noop} />,
    );
    expect(screen.getByLabelText('C を前へ')).toBeDisabled();
    expect(screen.getByLabelText('C を後ろへ')).toBeEnabled();
    expect(screen.getByLabelText('F を後ろへ')).toBeDisabled();
    expect(screen.getByLabelText('F を前へ')).toBeEnabled();
  });

  it('calls onRemove with the index when delete is clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<ChordList chords={[cMajor, aMinor]} onRemove={onRemove} onMove={noop} onInsert={noop} />);
    await user.click(screen.getByLabelText('Am を削除'));
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('calls onMove(from, from-1) when the back button is clicked', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(
      <ChordList chords={[cMajor, aMinor, fMajor]} onRemove={noop} onMove={onMove} onInsert={noop} />,
    );
    await user.click(screen.getByLabelText('Am を前へ'));
    expect(onMove).toHaveBeenCalledWith(1, 0);
  });

  it('calls onMove(from, from+1) when the forward button is clicked', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(
      <ChordList chords={[cMajor, aMinor, fMajor]} onRemove={noop} onMove={onMove} onInsert={noop} />,
    );
    await user.click(screen.getByLabelText('Am を後ろへ'));
    expect(onMove).toHaveBeenCalledWith(1, 2);
  });

  describe('drag and drop', () => {
    it('reorders an existing chord when dropped onto a later item', () => {
      const onMove = vi.fn();
      render(
        <ChordList
          chords={[cMajor, aMinor, fMajor]}
          onRemove={noop}
          onMove={onMove}
          onInsert={noop}
        />,
      );
      const [c, , f] = screen.getAllByRole('listitem');

      const dt = makeDataTransfer();
      fireEvent.dragStart(c, { dataTransfer: dt });
      fireEvent.dragOver(f, { dataTransfer: dt });
      fireEvent.drop(f, { dataTransfer: dt });

      // Dropped index 0 onto index 2; insert-before-target gives final index 1
      expect(onMove).toHaveBeenCalledWith(0, 1);
    });

    it('reorders an existing chord when dropped onto an earlier item', () => {
      const onMove = vi.fn();
      render(
        <ChordList
          chords={[cMajor, aMinor, fMajor]}
          onRemove={noop}
          onMove={onMove}
          onInsert={noop}
        />,
      );
      const [c, , f] = screen.getAllByRole('listitem');

      const dt = makeDataTransfer();
      fireEvent.dragStart(f, { dataTransfer: dt });
      fireEvent.dragOver(c, { dataTransfer: dt });
      fireEvent.drop(c, { dataTransfer: dt });

      expect(onMove).toHaveBeenCalledWith(2, 0);
    });

    it('does not call onMove when an item is dropped onto itself', () => {
      const onMove = vi.fn();
      render(
        <ChordList
          chords={[cMajor, aMinor, fMajor]}
          onRemove={noop}
          onMove={onMove}
          onInsert={noop}
        />,
      );
      const [c] = screen.getAllByRole('listitem');

      const dt = makeDataTransfer();
      fireEvent.dragStart(c, { dataTransfer: dt });
      fireEvent.dragOver(c, { dataTransfer: dt });
      fireEvent.drop(c, { dataTransfer: dt });

      expect(onMove).not.toHaveBeenCalled();
    });

    it('inserts a new chord when JSON payload is dropped onto an item', () => {
      const onInsert = vi.fn();
      render(
        <ChordList chords={[cMajor, fMajor]} onRemove={noop} onMove={noop} onInsert={onInsert} />,
      );
      const [, f] = screen.getAllByRole('listitem');

      const dt = makeDataTransfer({ [CHORD_MIME]: JSON.stringify(gMajor) });
      fireEvent.dragOver(f, { dataTransfer: dt });
      fireEvent.drop(f, { dataTransfer: dt });

      expect(onInsert).toHaveBeenCalledWith(gMajor, 1);
    });

    it('appends a chord when dropped onto the end zone', () => {
      const onInsert = vi.fn();
      render(<ChordList chords={[cMajor]} onRemove={noop} onMove={noop} onInsert={onInsert} />);
      const endZone = screen.getByTestId('chord-list-end-zone');

      const dt = makeDataTransfer({ [CHORD_MIME]: JSON.stringify(gMajor) });
      fireEvent.dragOver(endZone, { dataTransfer: dt });
      fireEvent.drop(endZone, { dataTransfer: dt });

      expect(onInsert).toHaveBeenCalledWith(gMajor, 1);
    });

    it('moves an existing chord to the end when dropped on the end zone', () => {
      const onMove = vi.fn();
      render(
        <ChordList
          chords={[cMajor, aMinor, fMajor]}
          onRemove={noop}
          onMove={onMove}
          onInsert={noop}
        />,
      );
      const [c] = screen.getAllByRole('listitem');
      const endZone = screen.getByTestId('chord-list-end-zone');

      const dt = makeDataTransfer();
      fireEvent.dragStart(c, { dataTransfer: dt });
      fireEvent.dragOver(endZone, { dataTransfer: dt });
      fireEvent.drop(endZone, { dataTransfer: dt });

      // chords.length = 3, drop index = 3, adjustedTo = 3 - 1 = 2
      expect(onMove).toHaveBeenCalledWith(0, 2);
    });

    it('writes the source index to dataTransfer on dragstart', () => {
      render(<ChordList chords={[cMajor, aMinor]} onRemove={noop} onMove={noop} onInsert={noop} />);
      const [, am] = screen.getAllByRole('listitem');

      const dt = makeDataTransfer();
      fireEvent.dragStart(am, { dataTransfer: dt });
      expect(dt.getData(CHORD_INDEX_MIME)).toBe('1');
    });
  });
});
