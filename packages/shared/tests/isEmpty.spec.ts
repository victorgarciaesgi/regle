import { isEmpty } from '../utils';

const emptyFile = new File([''], 'empty.png');
Object.defineProperty(emptyFile, 'size', { value: 0, configurable: true });

const normalFile = new File([''], 'normal.png');
Object.defineProperty(normalFile, 'size', { value: 1024 * 1024, configurable: true });

describe('test the isEmpty helper', () => {
  it.each([
    [[], false, false],
    [[], true],
    [[1], false],
    [undefined, true],
    [null, true],
    [false, false],
    [new Date(), false],
    [emptyFile, false],
    [normalFile, true],
    [{}, true],
    [{ a: 1 }, false],
    [1, false],
    ['asd', false],
    ['', true],
  ])('isEmpty(%s) should be %s', (a, expected, considerEmptyArrayInvalid = true) => {
    expect(isEmpty(a, considerEmptyArrayInvalid)).toBe(expected);
  });
});
