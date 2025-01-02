import { type ComputedRef, type MaybeRef } from 'vue';
import type {
  AllRulesDeclarations,
  DeepReactiveState,
  isDeepExact,
  ReglePartialRuleTree,
  RegleRuleDecl,
} from '../../types';
import type { NoInferLegacy, PrimitiveTypes, Unwrap } from '../../types/utils';

export interface inferRulesFn<TCustomRules extends Partial<AllRulesDeclarations>> {
  <
    TState extends Record<string, any>,
    TRules extends ReglePartialRuleTree<Unwrap<TState>, Partial<AllRulesDeclarations> & TCustomRules> & TValid,
    TValid = isDeepExact<
      NoInferLegacy<TRules>,
      ReglePartialRuleTree<Unwrap<TState>, Partial<AllRulesDeclarations> & TCustomRules>
    > extends true
      ? {}
      : never,
  >(
    state: MaybeRef<TState> | DeepReactiveState<TState> | undefined,
    rulesFactory: TRules
  ): NoInferLegacy<TRules>;
  <TState extends PrimitiveTypes, TRules extends RegleRuleDecl>(
    state: MaybeRef<TState>,
    rulesFactory: TRules
  ): NoInferLegacy<TRules>;
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
