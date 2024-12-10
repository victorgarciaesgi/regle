import { required } from '../../rules';
import { withTooltip } from '../withTooltip';

describe('withTooltip', () => {
  it('should register tooltips to an inline rule', () => {
    const inlineRule = withTooltip((value) => true, 'Hello tooltip');
    expect(inlineRule.tooltip?.(null, { $invalid: false, $dirty: false, $pending: false })).toBe('Hello tooltip');
    expect(inlineRule._tooltip).toBe('Hello tooltip');
  });

  it('should register tooltips to an rule definition', () => {
    const inlineRule = withTooltip(required, 'Hello tooltip');
    expect(inlineRule.tooltip?.(null, { $invalid: false, $dirty: false, $pending: false })).toBe('Hello tooltip');
    expect(inlineRule._tooltip).toBe('Hello tooltip');
  });
});
