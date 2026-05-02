import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ChordDiagram } from './ChordDiagram';

function texts(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('text'))
    .map((t) => t.textContent ?? '')
    .filter((t) => t.length > 0);
}

describe('ChordDiagram', () => {
  it('renders 6 strings and 5 fret lines', () => {
    const { container } = render(
      <ChordDiagram fingering={{ frets: [null, 3, 2, 0, 1, 0] }} />,
    );
    expect(container.querySelectorAll('line')).toHaveLength(11);
  });

  it('renders one dot per pressed string', () => {
    const { container } = render(
      <ChordDiagram fingering={{ frets: [null, 3, 2, 0, 1, 0] }} />,
    );
    expect(container.querySelectorAll('circle')).toHaveLength(3);
  });

  it('shows x for muted strings and o for open strings', () => {
    const { container } = render(
      <ChordDiagram fingering={{ frets: [null, 3, 2, 0, 1, 0] }} />,
    );
    const labels = texts(container);
    expect(labels).toContain('x');
    expect(labels).toContain('o');
  });

  it('shows a fret label when the chord sits above fret 4', () => {
    const { container } = render(
      <ChordDiagram fingering={{ frets: [null, 4, 6, 6, 6, 4] }} />,
    );
    expect(texts(container)).toContain('4fr');
  });

  it('omits the fret label for chords near the nut', () => {
    const { container } = render(
      <ChordDiagram fingering={{ frets: [null, 3, 2, 0, 1, 0] }} />,
    );
    expect(texts(container).some((t) => /\d+fr/.test(t))).toBe(false);
  });

  it('uses the supplied aria-label', () => {
    const { getByRole } = render(
      <ChordDiagram
        fingering={{ frets: [0, 2, 2, 0, 0, 0] }}
        ariaLabel="E minor"
      />,
    );
    expect(getByRole('img')).toHaveAttribute('aria-label', 'E minor');
  });
});
