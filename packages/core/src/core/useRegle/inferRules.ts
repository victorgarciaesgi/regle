import { type ComputedRef, type MaybeRef } from 'vue';
import type { AllRulesDeclarations, DeepReactiveState, ReglePartialRuleTree, RegleRuleDecl } from '../../types';
import type { isDeepExact, MaybeInput, NoInferLegacy, PrimitiveTypes, Unwrap } from '../../types/utils';
import type { MismatchInfo } from 'expect-type';

export interface inferRulesFn<TCustomRules extends Partial<AllRulesDeclarations>> {
  <
    TState extends Record<string, any> | MaybeInput<PrimitiveTypes>,
    TRules extends ReglePartialRuleTree<
      Unwrap<TState extends Record<string, any> ? TState : {}>,
      Partial<AllRulesDeclarations> & TCustomRules
    > &
      TValid,
    TDecl extends RegleRuleDecl<NonNullable<TState>, Partial<AllRulesDeclarations> & TCustomRules>,
    TValid = isDeepExact<NoInferLegacy<TRules>, Unwrap<TState extends Record<string, any> ? TState : {}>> extends true
      ? {}
      : MismatchInfo<
          NoInferLegacy<TRules>,
          ReglePartialRuleTree<
            Unwrap<TState extends Record<string, any> ? TState : {}>,
            Partial<AllRulesDeclarations> & TCustomRules
          >
        >,
  >(
    state: MaybeRef<TState> | DeepReactiveState<TState>,
    rulesFactory: TState extends MaybeInput<PrimitiveTypes> ? TDecl : TState extends Record<string, any> ? TRules : {}
  ): NonNullable<TState> extends PrimitiveTypes ? TDecl : TRules;
}

export function createInferRuleHelper<
  TCustomRules extends Partial<AllRulesDeclarations>,
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
 * Rule type helper to provide autocomplete and typecheck to your form rules or part of your form rules
 * It will just return the rules without any processing.
 *
 * @param state - The state reference
 * @param rules - Your rule tree
 */
export const inferRules = createInferRuleHelper();
