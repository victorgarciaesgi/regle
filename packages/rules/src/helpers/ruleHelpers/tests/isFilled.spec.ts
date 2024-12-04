import { isFilled } from '../isFilled';

describe('test the isFilled helper for "required"', () => {
  it.each([
    [[], true],
    [[1], true],
    [undefined, false],
    [null, false],
    [false, true],
    [new Date(), true],
    [{}, false],
    [{ a: 1 }, true],
    [1, true],
    ['asd', true],
    ['', false],
  ])('isFilled(%s) should be %s', (a, expected) => {
    expect(isFilled(a)).toBe(expected);
  });
});
