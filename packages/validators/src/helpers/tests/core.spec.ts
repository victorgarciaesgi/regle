import { ruleHelpers } from '../ruleHelpers';
import { ref } from 'vue';

describe('test the isFilled helper for "required"', () => {
  it.each([
    [[], false],
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
    expect(ruleHelpers.isFilled(a)).toBe(expected);
  });
});

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
    expect(ruleHelpers.size(a)).toBe(expected);
  });
});

describe('validates against a regex', () => {
  it('does not validate falsy values', () => {
    expect(ruleHelpers.regex('', /ad/)).toBe(true);
    expect(ruleHelpers.regex(null, /ad/)).toBe(true);
  });
  it('validates truthy values against regex', () => {
    expect(ruleHelpers.regex('aaa', /ad/)).toBe(false);
    expect(ruleHelpers.regex('ad', /ad/)).toBe(true);
    expect(ruleHelpers.regex('ads', /^a.*d$/, /\d{3}/)).toBe(false);
    expect(ruleHelpers.regex('a123d', /^a.*d$/, /\d{3}/)).toBe(true);
  });
});
