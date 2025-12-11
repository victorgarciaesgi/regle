import type { ExtendedRulesDeclarations, Maybe, RegleRuleDecl } from '@regle/core';
import { computed, toValue, type ComputedRef, type MaybeRefOrGetter } from 'vue';
import { isObject } from '../../../shared';
import { applyIf } from './applyIf';

function mapRulesWithCondition(
  condition: MaybeRefOrGetter<Maybe<boolean>>,
  rules: MaybeRefOrGetter<RegleRuleDecl<any, any>>,
  trueCheck: boolean
) {
  return Object.entries(toValue(rules)).map(([key, rule]) => {
    if (typeof rule === 'function' || (isObject(rule) && '_validator' in rule)) {
      return [key, applyIf(trueCheck ? condition : () => !toValue(condition), rule)];
    }
    return [key, rule];
  });
}
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
  TCustomRules extends Partial<ExtendedRulesDeclarations> = Partial<ExtendedRulesDeclarations>,
  TRulesDelc extends RegleRuleDecl<TValue, TCustomRules> = RegleRuleDecl<TValue, TCustomRules>,
>(
  _condition: MaybeRefOrGetter<Maybe<boolean>>,
  rules: MaybeRefOrGetter<TRulesDelc>,
  otherwiseRules?: MaybeRefOrGetter<TRulesDelc>
): ComputedRef<TRulesDelc> {
  return computed(() => {
    let trueRules = mapRulesWithCondition(_condition, rules, true);
    let falseRules = otherwiseRules ? mapRulesWithCondition(_condition, otherwiseRules, false) : [];
    return Object.fromEntries([...trueRules, ...falseRules]);
  });
}
