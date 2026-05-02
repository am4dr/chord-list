import { describe, expect, it } from 'vitest';
import { insertAt, moveItem, removeAt } from './array';

describe('removeAt', () => {
  it('removes the item at the given index', () => {
    expect(removeAt(['a', 'b', 'c'], 1)).toEqual(['a', 'c']);
  });

  it('removes the first item', () => {
    expect(removeAt(['a', 'b', 'c'], 0)).toEqual(['b', 'c']);
  });

  it('removes the last item', () => {
    expect(removeAt(['a', 'b', 'c'], 2)).toEqual(['a', 'b']);
  });

  it('returns a copy when index is out of range', () => {
    const input = ['a', 'b'];
    const out = removeAt(input, 5);
    expect(out).toEqual(['a', 'b']);
    expect(out).not.toBe(input);
  });
});

describe('insertAt', () => {
  it('inserts an item at the given index', () => {
    expect(insertAt(['a', 'b', 'c'], 'x', 1)).toEqual(['a', 'x', 'b', 'c']);
  });

  it('inserts at the start when index is 0', () => {
    expect(insertAt(['a', 'b'], 'x', 0)).toEqual(['x', 'a', 'b']);
  });

  it('appends when index equals length', () => {
    expect(insertAt(['a', 'b'], 'x', 2)).toEqual(['a', 'b', 'x']);
  });

  it('clamps an out-of-range index to the array bounds', () => {
    expect(insertAt(['a', 'b'], 'x', 99)).toEqual(['a', 'b', 'x']);
    expect(insertAt(['a', 'b'], 'x', -5)).toEqual(['x', 'a', 'b']);
  });

  it('inserts into an empty array', () => {
    expect(insertAt([], 'x', 0)).toEqual(['x']);
  });
});

describe('moveItem', () => {
  it('moves an item later in the array', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 0, 2)).toEqual(['b', 'c', 'a', 'd']);
  });

  it('moves an item earlier in the array', () => {
    expect(moveItem(['a', 'b', 'c', 'd'], 3, 1)).toEqual(['a', 'd', 'b', 'c']);
  });

  it('returns a copy unchanged when from === to', () => {
    expect(moveItem(['a', 'b', 'c'], 1, 1)).toEqual(['a', 'b', 'c']);
  });

  it('returns a copy unchanged when indices are out of range', () => {
    expect(moveItem(['a', 'b'], -1, 0)).toEqual(['a', 'b']);
    expect(moveItem(['a', 'b'], 0, 5)).toEqual(['a', 'b']);
  });
});
