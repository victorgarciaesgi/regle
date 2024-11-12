import { ref } from 'vue';
import { size } from '../size';

describe('get the size of a value', () => {
  it.each([
    [[], 0],
    [[1], 1],
    [{}, 0],
    [{ a: 1 }, 1],
    ['', 0],
    ['1', 1],
    [1, 1],
    [ref([]), 0],
    [ref([1]), 1],
  ])('size(%s) should be %s', (a, expected) => {
    expect(size(a)).toBe(expected);
  });
});
