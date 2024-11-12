import { regex } from '../regex';

describe('validates against a regex', () => {
  it('does not validate falsy values', () => {
    expect(regex('', /ad/)).toBe(true);
    expect(regex(null, /ad/)).toBe(true);
  });
  it('validates truthy values against regex', () => {
    expect(regex('aaa', /ad/)).toBe(false);
    expect(regex('ad', /ad/)).toBe(true);
    expect(regex('ads', /^a.*d$/, /\d{3}/)).toBe(false);
    expect(regex('a123d', /^a.*d$/, /\d{3}/)).toBe(true);
  });
});
