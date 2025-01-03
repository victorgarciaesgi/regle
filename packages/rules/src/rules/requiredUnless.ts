import type { RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';

/**
 * Requires non-empty data, only if provided data property, ref, or a function resolves to false.
 *
 * @param condition - the condition to disable the required rule
 */
export const requiredUnless: RegleRuleWithParamsDefinition<unknown, [condition: boolean], false, boolean> = createRule({
  type: 'required',
  validator(value: unknown, condition: boolean) {
    if (!condition) {
      return isFilled(value);
    }
    return true;
  },
  message: 'This field is required',
  active({ $params: [condition] }) {
    return !condition;
  },
});
