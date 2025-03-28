import type { RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';

/**
 * Requires non-empty data, only if provided data property, ref, or a function resolves to true.
 *
 * @param condition - the condition to enable the required rule
 */
export const requiredIf: RegleRuleWithParamsDefinition<unknown, [condition: boolean], false, boolean> = createRule({
  type: 'required',
  validator(value: unknown, condition: boolean) {
    if (condition) {
      return isFilled(value);
    }
    return true;
  },
  message: 'This field is required',
  active({ $params: [condition] }) {
    return condition;
  },
});
