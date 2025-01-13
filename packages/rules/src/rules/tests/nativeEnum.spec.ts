import { nativeEnum } from '../nativeEnum';

enum Food {
  Meat = 'Meat',
  Fish = 'Fish',
}

enum Position {
  One,
  Two,
}

describe('nativeEnum validator', () => {
  it('should not validate unvalid value', () => {
    expect(nativeEnum(Food).exec(5)).toBe(false);
  });

  it('should validate valid string', () => {
    expect(nativeEnum(Food).exec(Food.Meat)).toBe(true);
  });

  it('should validate the valid number', () => {
    expect(nativeEnum(Position).exec(Position.One)).toBe(true);
  });

  it('should validate undefined value', () => {
    expect(nativeEnum(Position).exec(undefined)).toBe(true);
  });

  it('should validate undefined option', () => {
    expect(nativeEnum(undefined as any).exec(5)).toBe(true);
  });
});
