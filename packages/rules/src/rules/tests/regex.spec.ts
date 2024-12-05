import { regex } from '../regex';

describe('regex validator', () => {
  it('does not validate falsy values', () => {
    expect(regex(/ad/).exec('')).toBe(true);
    expect(regex(/ad/).exec(null)).toBe(true);
  });
  it('validates truthy values against regex', () => {
    expect(regex(/ad/).exec('aaa')).toBe(false);
    expect(regex(/ad/).exec('ad')).toBe(true);
    expect(regex(/^a.*d$/, /\d{3}/).exec('ads')).toBe(false);
    expect(regex(/^a.*d$/, /\d{3}/).exec('a123d')).toBe(true);
  });
});
