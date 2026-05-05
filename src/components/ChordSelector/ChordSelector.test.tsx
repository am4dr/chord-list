import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { CHORD_MIME } from '../dnd';
import { ChordSelector } from './ChordSelector';

const radio = (name: string) => screen.getByRole('radio', { name });

describe('ChordSelector', () => {
  it('starts with C major selected', () => {
    render(<ChordSelector onSubmit={() => {}} />);
    expect(screen.getByTestId('chord-preview')).toHaveTextContent('C');
    expect(radio('C')).toBeChecked();
    expect(radio('♮')).toBeChecked();
    expect(radio('Major')).toBeChecked();
  });

  it('renders at least one diagram for the currently selected chord', async () => {
    const user = userEvent.setup();
    render(<ChordSelector onSubmit={() => {}} />);
    expect(screen.getAllByRole('img', { name: 'C' }).length).toBeGreaterThan(0);

    await user.click(radio('A'));
    await user.click(radio('Minor'));
    expect(screen.getAllByRole('img', { name: 'Am' }).length).toBeGreaterThan(0);
  });

  it('renders multiple voicing candidates for chords with both open and barre shapes', () => {
    render(<ChordSelector onSubmit={() => {}} />);
    // C major has open + E-shape barre + A-shape barre = 3 candidates.
    expect(screen.getAllByTestId('chord-candidate')).toHaveLength(3);
  });

  it('updates the preview when the root changes', async () => {
    const user = userEvent.setup();
    render(<ChordSelector onSubmit={() => {}} />);
    await user.click(radio('F'));
    expect(screen.getByTestId('chord-preview')).toHaveTextContent('F');
  });

  it('renders sharps and flats in the preview', async () => {
    const user = userEvent.setup();
    render(<ChordSelector onSubmit={() => {}} />);
    await user.click(radio('F'));
    await user.click(radio('♯'));
    expect(screen.getByTestId('chord-preview')).toHaveTextContent('F#');

    await user.click(radio('♭'));
    expect(screen.getByTestId('chord-preview')).toHaveTextContent('Fb');
  });

  it('appends m for minor quality in the preview', async () => {
    const user = userEvent.setup();
    render(<ChordSelector onSubmit={() => {}} />);
    await user.click(radio('A'));
    await user.click(radio('Minor'));
    expect(screen.getByTestId('chord-preview')).toHaveTextContent('Am');
  });

  it('submits a voicing when an 追加 button is clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ChordSelector onSubmit={onSubmit} />);

    await user.click(radio('C'));
    await user.click(radio('♯'));
    await user.click(radio('Minor'));

    const buttons = screen.getAllByRole('button', { name: '追加' });
    await user.click(buttons[0]);

    const arg = onSubmit.mock.calls[0][0];
    expect(arg.chord).toEqual({
      root: { natural: 'C', accidental: 'sharp' },
      quality: 'minor',
    });
    expect(arg.fingering).toBeDefined();
    expect(arg.fingering.frets).toHaveLength(6);
  });

  it('submits the specific candidate fingering that the user clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ChordSelector onSubmit={onSubmit} />);

    // C major has 3 candidates; the second and third are distinct from the first.
    const buttons = screen.getAllByRole('button', { name: '追加' });
    expect(buttons.length).toBeGreaterThan(1);
    await user.click(buttons[1]);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    const arg = onSubmit.mock.calls[0][0];
    expect(arg.chord).toEqual({ root: { natural: 'C' }, quality: 'major' });
    // Second candidate is the A-shape barre for C major (lower on the neck than E-shape).
    expect(arg.fingering.frets).toEqual([null, 3, 5, 5, 5, 3]);
  });

  it('omits the accidental key when natural is selected', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ChordSelector onSubmit={onSubmit} />);

    await user.click(radio('G'));
    const buttons = screen.getAllByRole('button', { name: '追加' });
    await user.click(buttons[0]);

    expect(onSubmit.mock.calls[0][0].chord).toEqual({
      root: { natural: 'G' },
      quality: 'major',
    });
  });

  it('writes a voicing to dataTransfer on candidate dragstart', async () => {
    const user = userEvent.setup();
    render(<ChordSelector onSubmit={() => {}} />);

    await user.click(radio('A'));
    await user.click(radio('Minor'));

    const data = new Map<string, string>();
    const dataTransfer = {
      getData: (type: string) => data.get(type) ?? '',
      setData: (type: string, value: string) => {
        data.set(type, value);
      },
      effectAllowed: 'all' as DataTransfer['effectAllowed'],
      dropEffect: 'none' as DataTransfer['dropEffect'],
    };

    const [firstCandidate] = screen.getAllByTestId('chord-candidate');
    fireEvent.dragStart(firstCandidate, { dataTransfer });

    const payload = JSON.parse(data.get(CHORD_MIME) ?? '{}');
    expect(payload.chord).toEqual({
      root: { natural: 'A' },
      quality: 'minor',
    });
    expect(payload.fingering).toBeDefined();
    expect(payload.fingering.frets).toHaveLength(6);
  });
});
