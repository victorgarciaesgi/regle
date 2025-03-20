import { maxValue } from '../maxValue';

describe('maxValue validator', () => {
  it('should validate max number', () => {
    expect(maxValue(5).exec(5)).toBe(true);
  });

  it('should not validate max number without allowEqual', () => {
    expect(maxValue(5, { allowEqual: false }).exec(5)).toBe(false);
  });

  it('should validate the valid number', () => {
    expect(maxValue(5).exec(4)).toBe(true);
  });

  it('should validate the invalid number', () => {
    expect(maxValue(5).exec(6)).toBe(false);
  });

  it('should not validate the string value', () => {
    expect(maxValue(5).exec('not string here' as any)).toBe(true);
  });

  it('should not validate the object value', () => {
    expect(maxValue(5).exec({ hello: 'world' } as any)).toBe(true);
  });
});
