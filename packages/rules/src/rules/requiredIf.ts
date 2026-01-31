import type { RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../helpers';

/**
 * Requires non-empty data, only if provided data property, ref, or a function resolves to `true`.
 *
 * @param condition - The condition to enable the required rule (can be a ref, getter, or value)
 *
 * @example
 * ```ts
 * import { requiredIf } from '@regle/rules';
 *
 * const form = ref({ name: '', condition: false });
 * const conditionRef = ref(false);
 *
 * const { r$ } = useRegle(form, {
 *   name: {
 *     required: requiredIf(() => form.value.condition),
 *     // or with a ref
 *     required: requiredIf(conditionRef),
 *   },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#requiredif Documentation}
 */
export const requiredIf: RegleRuleWithParamsDefinition<'required', unknown, [condition: boolean], false, boolean> =
  createRule({
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
