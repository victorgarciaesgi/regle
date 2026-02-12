import type { ExtendedRulesDeclarations, Maybe, RegleRuleDecl, RegleRuleDefinition } from '@regle/core';
import { toValue, type MaybeRefOrGetter } from 'vue';
import { isObject } from '../../../shared';
import { applyIf } from './applyIf';

type MapRulesToUnsafeRules<TRules extends RegleRuleDecl<any, any>> = {
  [K in keyof TRules]: TRules[K] extends RegleRuleDefinition<
    infer TType,
    infer TValue,
    infer TParams,
    infer TAsync,
    infer TMetadata,
    infer TInput,
    infer TFilteredValue,
    boolean
  >
    ? RegleRuleDefinition<TType, TValue, TParams, TAsync, TMetadata, TInput, TFilteredValue, false>
    : TRules[K];
};

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
export function assignIf<
  TValue extends unknown = any,
  TCustomRules extends Partial<ExtendedRulesDeclarations> = Partial<ExtendedRulesDeclarations>,
  TRulesDelc extends RegleRuleDecl<TValue, TCustomRules> = RegleRuleDecl<TValue, TCustomRules>,
>(
  _condition: MaybeRefOrGetter<Maybe<boolean>>,
  rules: MaybeRefOrGetter<TRulesDelc>,
  otherwiseRules?: MaybeRefOrGetter<TRulesDelc>
): MapRulesToUnsafeRules<TRulesDelc> {
  let trueRules = mapRulesWithCondition(_condition, rules, true);
  let falseRules = otherwiseRules ? mapRulesWithCondition(_condition, otherwiseRules, false) : [];
  return Object.fromEntries([...trueRules, ...falseRules]);
}
