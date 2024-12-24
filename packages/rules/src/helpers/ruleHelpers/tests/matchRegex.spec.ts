import { matchRegex } from '../matchRegex';

describe('validates against a regex', () => {
  it('does not validate falsy values', () => {
    expect(matchRegex('', /ad/)).toBe(true);
    expect(matchRegex(null, /ad/)).toBe(true);
  });
  it('validates truthy values against regex', () => {
    expect(matchRegex('aaa', /ad/)).toBe(false);
    expect(matchRegex('ad', /ad/)).toBe(true);
    expect(matchRegex('ads', /^a.*d$/, /\d{3}/)).toBe(false);
    expect(matchRegex('a123d', /^a.*d$/, /\d{3}/)).toBe(true);
  });
});
