import { and } from '../and';
import { ruleMockSimple, ruleMockParams } from '../../../../../tests/mocks';

describe('and validator', () => {
  it('should not validate no functions', () => {
    const result = and();

    expect(result.validator(undefined)).toBe(false);
  });

  it('should validate one function', () => {
    const result = and(ruleMockSimple);
    expect(result.validator(undefined)).toBe(false);
  });
});
