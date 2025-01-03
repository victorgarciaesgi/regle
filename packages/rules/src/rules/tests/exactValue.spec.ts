import { exactValue } from '../exactValue';

describe('exactValue validator', () => {
  it('should validate max number', () => {
    expect(exactValue(5).exec(5)).toBe(true);
  });

  it('should validate the valid number', () => {
    expect(exactValue(5).exec(4)).toBe(false);
  });

  it('should validate the invalid number', () => {
    expect(exactValue(5).exec(6)).toBe(false);
  });

  it('should not validate the string value', () => {
    expect(exactValue(5).exec('not string here' as any)).toBe(true);
  });

  it('should not validate the object value', () => {
    expect(exactValue(5).exec({ hello: 'world' } as any)).toBe(true);
  });
});
