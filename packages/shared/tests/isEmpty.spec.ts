import { isEmpty } from '../utils';

describe('test the isEmpty helper', () => {
  it.each([
    [[], false, false],
    [[], true],
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
  ])('isEmpty(%s) should be %s', (a, expected, considerEmptyArrayInvalid = true) => {
    expect(isEmpty(a, considerEmptyArrayInvalid)).toBe(expected);
  });
});
