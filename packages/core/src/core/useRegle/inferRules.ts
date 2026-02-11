import { type ComputedRef, type MaybeRef } from 'vue';
import type {
  DeepReactiveState,
  DefaultValidatorsTree,
  ExtendedRulesDeclarationsOverrides,
  ReglePartialRuleTree,
  RegleRuleDecl,
} from '../../types';
import type { Maybe, MaybeInput, PrimitiveTypes, Unwrap } from '../../types/utils';

export interface inferRulesFn<TCustomRules extends Partial<ExtendedRulesDeclarationsOverrides>> {
  <
    TState extends MaybeRef<Record<string, any> | MaybeInput<PrimitiveTypes>>,
    TRules extends ReglePartialRuleTree<
      Unwrap<TState extends Record<string, any> ? TState : {}>,
      Partial<DefaultValidatorsTree> & TCustomRules
    >,
    TDecl extends RegleRuleDecl<NonNullable<TState>, Partial<DefaultValidatorsTree> & TCustomRules>,
  >(
    state: Maybe<TState> | DeepReactiveState<TState>,
    rulesFactory: Unwrap<TState> extends MaybeInput<PrimitiveTypes>
      ? TDecl
      : Unwrap<TState> extends Record<string, any>
        ? TRules
        : {}
  ): NonNullable<Unwrap<TState>> extends PrimitiveTypes ? TDecl : TRules;
}

export function createInferRuleHelper<
  TCustomRules extends Partial<ExtendedRulesDeclarationsOverrides>,
>(): inferRulesFn<TCustomRules> {
  function inferRules(
    state: Record<string, any>,
    rulesFactory: Record<string, any> | (() => Record<string, any>) | ComputedRef<Record<string, any>>
  ) {
    return rulesFactory;
  }
  return inferRules as any;
}

/**
 * Type helper to provide autocomplete and type-checking for your form rules.
 * It returns the rules without any processing - useful with computed rules.
 *
 * @param state - The state reference
 * @param rules - Your rule tree
 * @returns The rules object (passthrough)
 *
 * @example
 * ```ts
 * import { inferRules, useRegle } from '@regle/core';
 * import { required, minLength } from '@regle/rules';
 *
 * const state = ref({ name: '' });
 *
 * // inferRules preserves TypeScript autocompletion
 * const rules = computed(() => {
 *   return inferRules(state, {
 *     name: { required, minLength: minLength(2) }
 *   })
 * });
 *
 * const { r$ } = useRegle(state, rules);
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/#dynamic-rules-object Documentation}
 */
export const inferRules = createInferRuleHelper();
