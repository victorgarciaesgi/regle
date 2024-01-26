import { and } from '../and';
import { ruleMockSimple } from '../../../../../tests/mocks';

describe('and validator', () => {
  it('should not validate no functions', () => {
    const result = and();

    expect(result.exec(undefined)).toBe(false);
  });

  it('should validate one function', () => {
    const result = and(ruleMockSimple);
    expect(result.exec(undefined)).toBe(false);
  });
});
