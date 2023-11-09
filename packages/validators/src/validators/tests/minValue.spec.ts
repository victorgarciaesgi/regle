import { minValue } from '../minValue';

describe('minValue validator', () => {
  it('should validate min number', () => {
    expect(minValue(5).exec(5)).toBe(true);
  });

  it('should validate the valid number', () => {
    expect(minValue(5).exec(6)).toBe(true);
  });

  it('should validate the invalid number', () => {
    expect(minValue(5).exec(4)).toBe(false);
  });

  it('should validate the string value', () => {
    expect(minValue(5).exec('not string here' as any)).toBe(false);
  });

  it('should validate the object value', () => {
    expect(minValue(5).exec({ hello: 'world' } as any)).toBe(false);
  });
});
