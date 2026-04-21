import { ref } from 'vue';
import { getSize } from '../getSize';

describe('get the size of a value', () => {
  it.each([
    [null, 0],
    [undefined, 0],
    [NaN, 0],
    [Number.NaN, 0],
    [[], 0],
    [[1], 1],
    [{}, 0],
    [{ a: 1 }, 1],
    ['', 0],
    ['asdf', 4],
    ['1', 1],
    ['123', 3],
    ['123.52', 6],
    [0, 1],
    [1, 1],
    [123, 3],
    [123.52, 6],
  ])('size(%s) should be %s', (a, expected) => {
    expect({
      value: getSize(a),
      getter: getSize(() => a),
      ref: getSize(ref(a)),
    }).toMatchObject({
      value: expected,
      getter: expected,
      ref: expected,
    });
  });
});
