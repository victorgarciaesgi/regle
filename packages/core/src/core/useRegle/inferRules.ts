import type { ComputedRef, MaybeRef } from 'vue';
import type {
  AllRulesDeclarations,
  DeepReactiveState,
  isDeepExact,
  ReglePartialValidationTree,
  RegleRuleDecl,
} from '../../types';
import type { NoInferLegacy, Unwrap } from '../../types/utils';

export interface inferRulesFn<TCustomRules extends Partial<AllRulesDeclarations>> {
  <
    TState extends Record<string, any>,
    TRules extends ReglePartialValidationTree<
      Unwrap<TState>,
      Partial<AllRulesDeclarations> & TCustomRules
    > &
      TValid,
    TValid = isDeepExact<
      NoInferLegacy<TRules>,
      ReglePartialValidationTree<Unwrap<TState>, Partial<AllRulesDeclarations> & TCustomRules>
    > extends true
      ? {}
      : never,
  >(
    state: MaybeRef<TState> | DeepReactiveState<TState>,
    rulesFactory: TRules
  ): typeof rulesFactory;
  <TState extends unknown, TRules extends RegleRuleDecl>(
    state: MaybeRef<TState>,
    rulesFactory: TRules
  ): typeof rulesFactory;
}

export function createInferRuleHelper<
  TCustomRules extends Partial<AllRulesDeclarations>,
>(): inferRulesFn<TCustomRules> {
  function inferRules(
    state: Record<string, any>,
    rulesFactory:
      | Record<string, any>
      | (() => Record<string, any>)
      | ComputedRef<Record<string, any>>
  ) {
    return rulesFactory;
  }
  return inferRules as any;
}

export const inferRules = createInferRuleHelper();
