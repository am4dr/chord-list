import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Chord } from '../../domain/chord';
import { ChordList } from './ChordList';

const cMajor: Chord = { root: { natural: 'C' }, quality: 'major' };
const aMinor: Chord = { root: { natural: 'A' }, quality: 'minor' };
const fMajor: Chord = { root: { natural: 'F' }, quality: 'major' };

const noop = () => {};

describe('ChordList', () => {
  it('shows an empty state when no chords are present', () => {
    render(<ChordList chords={[]} onRemove={noop} onMove={noop} />);
    expect(screen.getByTestId('chord-list-empty')).toBeInTheDocument();
  });

  it('renders one list item per chord', () => {
    render(<ChordList chords={[cMajor, aMinor, fMajor]} onRemove={noop} onMove={noop} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
  });

  it('shows the formatted chord name for each entry', () => {
    render(<ChordList chords={[cMajor, aMinor, fMajor]} onRemove={noop} onMove={noop} />);
    expect(screen.getByText('C')).toBeInTheDocument();
    expect(screen.getByText('Am')).toBeInTheDocument();
    expect(screen.getByText('F')).toBeInTheDocument();
  });

  it('renders a chord diagram with the chord name as aria-label', () => {
    render(<ChordList chords={[cMajor]} onRemove={noop} onMove={noop} />);
    expect(screen.getByRole('img', { name: 'C' })).toBeInTheDocument();
  });

  it('disables move-back on the first item and move-forward on the last', () => {
    render(<ChordList chords={[cMajor, aMinor, fMajor]} onRemove={noop} onMove={noop} />);
    expect(screen.getByLabelText('C を前へ')).toBeDisabled();
    expect(screen.getByLabelText('C を後ろへ')).toBeEnabled();
    expect(screen.getByLabelText('F を後ろへ')).toBeDisabled();
    expect(screen.getByLabelText('F を前へ')).toBeEnabled();
  });

  it('calls onRemove with the index when delete is clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(<ChordList chords={[cMajor, aMinor]} onRemove={onRemove} onMove={noop} />);
    await user.click(screen.getByLabelText('Am を削除'));
    expect(onRemove).toHaveBeenCalledWith(1);
  });

  it('calls onMove(from, from-1) when the back button is clicked', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(<ChordList chords={[cMajor, aMinor, fMajor]} onRemove={noop} onMove={onMove} />);
    await user.click(screen.getByLabelText('Am を前へ'));
    expect(onMove).toHaveBeenCalledWith(1, 0);
  });

  it('calls onMove(from, from+1) when the forward button is clicked', async () => {
    const user = userEvent.setup();
    const onMove = vi.fn();
    render(<ChordList chords={[cMajor, aMinor, fMajor]} onRemove={noop} onMove={onMove} />);
    await user.click(screen.getByLabelText('Am を後ろへ'));
    expect(onMove).toHaveBeenCalledWith(1, 2);
  });
});
