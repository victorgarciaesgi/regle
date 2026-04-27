import { ref } from 'vue';
import { getSize } from '../getSize';

describe('getSize helper', () => {
  it('works with plain values', () => {
    expect(getSize('asdf')).toBe(4);
  });

  it('works with ref values', () => {
    expect(getSize(ref('asdf'))).toBe(4);
  });

  it('works with getters', () => {
    expect(getSize(() => 'asdf')).toBe(4);
  });

  it.each([
    [[], 0],
    [[1], 1],
    [{}, 0],
    [{ a: 1, b: undefined, c: null }, 3],
    ['', 0],
    ['asdf', 4],
    ['1', 1],
    ['123', 3],
    ['123.52', 6],
    ['-123.52', 7],
    [NaN, 0],
    [Number.NaN, 0],
    [0, 1],
    [1, 1],
    [123, 3],
    [123.52, 6],
    [-123.52, 7],
    [new Map<number, string>([]), 0],
    [
      new Map<number, string>([
        [1, 'one'],
        [2, 'two'],
        [4, 'four'],
      ]),
      3,
    ],
    [new Set<string>([]), 0],
    [new Set<string>(['a']), 1],
  ])('size(%s) should be %s', (a, expected) => {
    expect(getSize(a)).toBe(expected);
  });
});
