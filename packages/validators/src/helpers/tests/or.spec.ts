import { ruleMockSimple } from '../../../../../tests/mocks';
import { or } from '../or';

describe('or validator', () => {
  it('should not validate no functions', () => {
    const result = or();

    expect(result.validator(undefined)).toBe(false);
  });

  it('should validate one function', () => {
    const result = or(ruleMockSimple);
    expect(result.validator(undefined)).toBe(false);
  });
});
