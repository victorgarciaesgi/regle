import { createRule } from '@regle/core';
import { required } from '../../rules';
import { withTooltip } from '../withTooltip';

describe('withTooltip', () => {
  it('should register tooltips to an inline rule', () => {
    const inlineRule = withTooltip((_value) => true, 'Hello tooltip');
    expect(inlineRule.tooltip?.({} as any)).toBe('Hello tooltip');
    expect(inlineRule._tooltip).toBe('Hello tooltip');
  });

  it('should register tooltips to an rule definition', () => {
    const inlineRule = withTooltip(required, 'Hello tooltip');
    expect(inlineRule.tooltip?.({} as any)).toBe('Hello tooltip');
    expect(inlineRule._tooltip).toBe('Hello tooltip');
  });

  it('should fallback to empty params when missing', () => {
    const customRule = createRule({
      type: 'custom',
      validator(value: unknown) {
        return Boolean(value);
      },
      message: 'Error',
    });

    customRule._params = undefined as any;
    const wrappedRule = withTooltip(customRule, 'Hello tooltip');

    expect(wrappedRule._params).toStrictEqual([]);
  });
});
