export function removeAt<T>(arr: ReadonlyArray<T>, index: number): T[] {
  return arr.filter((_, i) => i !== index);
}

export function moveItem<T>(arr: ReadonlyArray<T>, from: number, to: number): T[] {
  if (from < 0 || from >= arr.length || to < 0 || to >= arr.length || from === to) {
    return [...arr];
  }
  const next = [...arr];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}
