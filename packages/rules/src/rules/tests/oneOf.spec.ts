import { oneOf } from '../oneOf';

describe('oneOf validator', () => {
  it('should not validate unvalid value', () => {
    expect(oneOf(['One', 'Two']).exec(5)).toBe(false);
  });

  it('should validate valid string', () => {
    expect(oneOf(['One', 'Two']).exec('Two')).toBe(true);
  });

  it('should validate the valid number', () => {
    expect(oneOf([4, 5]).exec(4)).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(oneOf([4, 5, 6]).exec(undefined)).toBe(true);
  });

  it('should validate undefined option', () => {
    expect(oneOf(undefined as any).exec(5)).toBe(true);
  });
});
