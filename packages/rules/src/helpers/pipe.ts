import type { ExtendedRulesDeclarations, FormRuleDeclaration, Maybe, RegleRuleDecl } from '@regle/core';
import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue';
import { isObject } from '../../../shared';
import { applyIf } from './applyIf';

/**
 * The `assignIf` is a shorthand for conditional destructuring assignment.
 * It allows applying **multiple rules** to a field conditionally.
 *
 * @param _condition - The condition to check (ref, getter, or value)
 * @param rules - An object of rules to apply conditionally
 * @returns A computed ref containing the rules that only apply when the condition is truthy
 *
 * @example
 * ```ts
 * import { required, email, minLength, assignIf } from '@regle/rules';
 *
 * const condition = ref(false);
 *
 * const { r$ } = useRegle(ref({ name: '', email: '' }), {
 *   name: assignIf(condition, { required, minLength: minLength(4) }),
 *   email: { email },
 * });
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/rules-operators#assignif Documentation}
 */
export function pipe<
  TValue extends unknown = any,
  TCustomRules extends Partial<ExtendedRulesDeclarations> = Partial<ExtendedRulesDeclarations>,
  TRulesDelc extends RegleRuleDecl<TValue, TCustomRules> = RegleRuleDecl<TValue, TCustomRules>,
>(rules: [FormRuleDeclaration<unknown>, ...FormRuleDeclaration<unknown>[]]): ComputedRef<TRulesDelc> {
  return computed(() => {
    return {} as any;
  });
}
