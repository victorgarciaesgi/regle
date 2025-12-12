import { type ComputedRef, type MaybeRef } from 'vue';
import type {
  ExtendedRulesDeclarations,
  DeepReactiveState,
  DefaultValidatorsTree,
  ReglePartialRuleTree,
  RegleRuleDecl,
} from '../../types';
import type { DeepExact, MaybeInput, PrimitiveTypes, Unwrap } from '../../types/utils';

export interface inferRulesFn<TCustomRules extends Partial<ExtendedRulesDeclarations>> {
  <
    TState extends Record<string, any> | MaybeInput<PrimitiveTypes>,
    TRules extends DeepExact<
      TRules,
      ReglePartialRuleTree<
        Unwrap<TState extends Record<string, any> ? TState : {}>,
        Partial<DefaultValidatorsTree> & TCustomRules
      >
    >,
    TDecl extends RegleRuleDecl<NonNullable<TState>, Partial<DefaultValidatorsTree> & TCustomRules>,
  >(
    state: MaybeRef<TState> | DeepReactiveState<TState> | undefined,
    rulesFactory: TState extends MaybeInput<PrimitiveTypes> ? TDecl : TState extends Record<string, any> ? TRules : {}
  ): NonNullable<TState> extends PrimitiveTypes ? TDecl : TRules;
}

export function createInferRuleHelper<
  TCustomRules extends Partial<ExtendedRulesDeclarations>,
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
