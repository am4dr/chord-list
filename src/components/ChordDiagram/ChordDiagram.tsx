import type { Fingering } from '../../domain/fingering';
import { getFretWindow } from './fretWindow';

export interface ChordDiagramProps {
  fingering: Fingering;
  width?: number;
  ariaLabel?: string;
}

const STRINGS = 6;
const FRETS_VISIBLE = 4;
const VIEW_W = 80;
const VIEW_H = 110;
const GRID_LEFT = 10;
const GRID_RIGHT = 70;
const GRID_TOP = 15;
const GRID_BOTTOM = 95;
const STRING_SPACING = (GRID_RIGHT - GRID_LEFT) / (STRINGS - 1);
const FRET_SPACING = (GRID_BOTTOM - GRID_TOP) / FRETS_VISIBLE;

export function ChordDiagram({ fingering, width = 100, ariaLabel = 'chord diagram' }: ChordDiagramProps) {
  const view = getFretWindow(fingering.frets);

  const stringX = (i: number) => GRID_LEFT + i * STRING_SPACING;
  const fretY = (i: number) => GRID_TOP + i * FRET_SPACING;
  const dotY = (fret: number) => fretY(fret - view.start) + FRET_SPACING / 2;

  return (
    <svg
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      width={width}
      role="img"
      aria-label={ariaLabel}
    >
      {Array.from({ length: STRINGS }, (_, i) => (
        <line
          key={`s${i}`}
          x1={stringX(i)}
          y1={GRID_TOP}
          x2={stringX(i)}
          y2={GRID_BOTTOM}
          stroke="currentColor"
          strokeWidth={1}
        />
      ))}
      {Array.from({ length: FRETS_VISIBLE + 1 }, (_, i) => (
        <line
          key={`f${i}`}
          x1={GRID_LEFT}
          y1={fretY(i)}
          x2={GRID_RIGHT}
          y2={fretY(i)}
          stroke="currentColor"
          strokeWidth={i === 0 && view.showNut ? 3 : 1}
        />
      ))}
      {fingering.frets.map((f, i) => {
        const text = f === null ? 'x' : f === 0 ? 'o' : null;
        if (text === null) return null;
        return (
          <text
            key={`m${i}`}
            x={stringX(i)}
            y={GRID_TOP - 4}
            textAnchor="middle"
            fontSize={8}
            fontFamily="sans-serif"
            fill="currentColor"
          >
            {text}
          </text>
        );
      })}
      {fingering.frets.map((f, i) =>
        f !== null && f > 0 ? (
          <circle key={`d${i}`} cx={stringX(i)} cy={dotY(f)} r={4} fill="currentColor" />
        ) : null,
      )}
      {!view.showNut && (
        <text
          x={GRID_RIGHT + 3}
          y={fretY(0) + FRET_SPACING / 2 + 3}
          fontSize={8}
          fontFamily="sans-serif"
          fill="currentColor"
        >
          {view.start}fr
        </text>
      )}
    </svg>
  );
}
