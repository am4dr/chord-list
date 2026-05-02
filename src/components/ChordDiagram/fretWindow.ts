export interface FretWindow {
  start: number;
  showNut: boolean;
}

const FRETS_VISIBLE = 4;

export function getFretWindow(frets: ReadonlyArray<number | null>): FretWindow {
  const positives = frets.filter((f): f is number => f !== null && f > 0);
  if (positives.length === 0) {
    return { start: 1, showNut: true };
  }
  const max = Math.max(...positives);
  if (max <= FRETS_VISIBLE) {
    return { start: 1, showNut: true };
  }
  const min = Math.min(...positives);
  return { start: min, showNut: false };
}
