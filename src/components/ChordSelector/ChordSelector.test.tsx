import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
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

  it('renders the diagram for the currently selected chord', async () => {
    const user = userEvent.setup();
    render(<ChordSelector onSubmit={() => {}} />);
    expect(screen.getByRole('img', { name: 'C' })).toBeInTheDocument();

    await user.click(radio('A'));
    await user.click(radio('Minor'));
    expect(screen.getByRole('img', { name: 'Am' })).toBeInTheDocument();
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

  it('submits the current chord when the add button is clicked', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ChordSelector onSubmit={onSubmit} />);

    await user.click(radio('C'));
    await user.click(radio('♯'));
    await user.click(radio('Minor'));
    await user.click(screen.getByRole('button', { name: '追加' }));

    expect(onSubmit).toHaveBeenCalledWith({
      root: { natural: 'C', accidental: 'sharp' },
      quality: 'minor',
    });
  });

  it('omits the accidental key when natural is selected', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ChordSelector onSubmit={onSubmit} />);

    await user.click(radio('G'));
    await user.click(screen.getByRole('button', { name: '追加' }));

    expect(onSubmit).toHaveBeenCalledWith({
      root: { natural: 'G' },
      quality: 'major',
    });
  });
});
