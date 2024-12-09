import { isEmpty } from '../utils';

describe('test the isEmpty helper', () => {
  it.each([
    [[], false],
    [[1], false],
    [undefined, true],
    [null, true],
    [false, false],
    [new Date(), false],
    [{}, true],
    [{ a: 1 }, false],
    [1, false],
    ['asd', false],
    ['', true],
  ])('isFilled(%s) should be %s', (a, expected) => {
    expect(isEmpty(a)).toBe(expected);
  });
});
