import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Chord } from '../../domain/chord';
import { getFingering, type ChordVoicing } from '../../domain/fingering';
import { CHORD_INDEX_MIME, CHORD_MIME } from '../dnd';
import { ChordList } from './ChordList';

const v = (chord: Chord): ChordVoicing => ({ chord, fingering: getFingering(chord)! });

const cMajor = v({ root: { natural: 'C' }, quality: 'major' });
const aMinor = v({ root: { natural: 'A' }, quality: 'minor' });
const fMajor = v({ root: { natural: 'F' }, quality: 'major' });
const gMajor = v({ root: { natural: 'G' }, quality: 'major' });

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
  it('shows an empty state when no voicings are present', () => {
    render(<ChordList voicings={[]} onRemove={noop} onMove={noop} onInsert={noop} />);
    expect(screen.getByTestId('chord-list-empty')).toBeInTheDocument();
  });

  it('renders one chord diagram per voicing', () => {
    render(
      <ChordList
        voicings={[cMajor, aMinor, fMajor]}
        onRemove={noop}
        onMove={noop}
        onInsert={noop}
      />,
    );
    expect(screen.getAllByRole('img')).toHaveLength(3);
  });

  it('shows the formatted chord name for each entry', () => {
    render(
      <ChordList
        voicings={[cMajor, aMinor, fMajor]}
        onRemove={noop}
        onMove={noop}
        onInsert={noop}
      />,
    );
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('Am')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
  });

  it('renders a chord diagram with the chord name as aria-label', () => {
    render(<ChordList voicings={[cMajor]} onRemove={noop} onMove={noop} onInsert={noop} />);
    expect(screen.getByRole('img', { name: 'C' })).toBeInTheDocument();
  });

  it('disables move-back on the first item and move-forward on the last', () => {
    render(
      <ChordList
        voicings={[cMajor, aMinor, fMajor]}
        onRemove={noop}
        onMove={noop}
        onInsert={noop}
      />,
    );
    expect(screen.getByLabelText('C を前へ')).toBeDisabled();
    expect(screen.getByLabelText('C を後ろへ')).toBeEnabled();
    expect(screen.getByLabelText('F を後ろへ')).toBeDisabled();
    expect(screen.getByLabelText('F を前へ')).toBeEnabled();
  });

  it('calls onRemove with the index when delete is clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <ChordList voicings={[cMajor, aMinor]} onRemove={onRemove} onMove={noop} onInsert={noop} />,
    );
    await user.click(screen.getByLabelText('Am を削除'));
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('calls onMove(from, from-1) when the back button is clicked', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(
      <ChordList
        voicings={[cMajor, aMinor, fMajor]}
        onRemove={noop}
        onMove={onMove}
        onInsert={noop}
      />,
    );
    await user.click(screen.getByLabelText('Am を前へ'));
    expect(onMove).toHaveBeenCalledWith(1, 0);
  });

  it('calls onMove(from, from+1) when the forward button is clicked', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(
      <ChordList
        voicings={[cMajor, aMinor, fMajor]}
        onRemove={noop}
        onMove={onMove}
        onInsert={noop}
      />,
    );
    await user.click(screen.getByLabelText('Am を後ろへ'));
    expect(onMove).toHaveBeenCalledWith(1, 2);
  });

  describe('drag and drop', () => {
    it('moves a voicing to the drop target position when dropped onto a later item', () => {
      const onMove = vi.fn();
      render(
        <ChordList
          voicings={[cMajor, aMinor, fMajor]}
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

      // Drag C (0) onto F (2) → C ends up at index 2 → [Am, F, C]
      expect(onMove).toHaveBeenCalledWith(0, 2);
    });

    it('reorders an existing voicing when dropped onto an earlier item', () => {
      const onMove = vi.fn();
      render(
        <ChordList
          voicings={[cMajor, aMinor, fMajor]}
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
          voicings={[cMajor, aMinor, fMajor]}
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

    it('inserts a new voicing when JSON payload is dropped onto an item', () => {
      const onInsert = vi.fn();
      render(
        <ChordList
          voicings={[cMajor, fMajor]}
          onRemove={noop}
          onMove={noop}
          onInsert={onInsert}
        />,
      );
      const [, f] = screen.getAllByRole('listitem');

      const dt = makeDataTransfer({ [CHORD_MIME]: JSON.stringify(gMajor) });
      fireEvent.dragOver(f, { dataTransfer: dt });
      fireEvent.drop(f, { dataTransfer: dt });

      expect(onInsert).toHaveBeenCalledWith(gMajor, 1);
    });

    it('writes the source index to dataTransfer on dragstart', () => {
      render(
        <ChordList voicings={[cMajor, aMinor]} onRemove={noop} onMove={noop} onInsert={noop} />,
      );
      const [, am] = screen.getAllByRole('listitem');

      const dt = makeDataTransfer();
      fireEvent.dragStart(am, { dataTransfer: dt });
      expect(dt.getData(CHORD_INDEX_MIME)).toBe('1');
    });
  });
});
