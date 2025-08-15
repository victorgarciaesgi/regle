import type { AllRulesDeclarations, Maybe, RegleRuleDecl } from '@regle/core';
import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue';

/**
 * The assignIf is a shorthand for conditional destructuring assignment.
 * It allows to apply multiple rules to a field conditionally.
 *
 * @example
 * ```ts
 * const condition = ref(false);
 *
 * const { r$ } = useRegle(ref({ name: '', email: '' }), {
 *   name: assignIf(condition, { required, minLength: minLength(4) }),
 *   email: { email },
 * })
 * ```
 */
export function assignIf<
  TValue extends unknown = any,
  TCustomRules extends Partial<AllRulesDeclarations> = Partial<AllRulesDeclarations>,
  TRulesDelc extends RegleRuleDecl<TValue, TCustomRules> = RegleRuleDecl<TValue, TCustomRules>,
>(_condition: MaybeRefOrGetter<Maybe<boolean>>, rules: TRulesDelc): ComputedRef<TRulesDelc> {
  return computed(() => {
    if (toValue(_condition)) {
      return rules;
    }
    return {} as TRulesDelc;
  });
}
