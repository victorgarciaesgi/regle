import { ref, type ComputedRef, type MaybeRef } from 'vue';
import type { DeepReactiveState, toValibot, ValibotChild } from '../types';
import type { NoInferLegacy, PrimitiveTypes, RegleRuleDecl, Unwrap } from '@regle/core';

export interface inferValibotSchemaFn {
  <TState extends Record<string, any>, TValibotSchema extends toValibot<Unwrap<TState>> = toValibot<Unwrap<TState>>>(
    state: MaybeRef<TState> | DeepReactiveState<TState> | undefined,
    rulesFactory: TValibotSchema
  ): NoInferLegacy<TValibotSchema>;
  <TState extends PrimitiveTypes, TValibotSchema extends ValibotChild<TState> = ValibotChild<TState>>(
    state: MaybeRef<TState>,
    rulesFactory: TValibotSchema
  ): NoInferLegacy<TValibotSchema>;
}

export function createInferValibotSchemaHelper(): inferValibotSchemaFn {
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
 * @param schema - Your valibot schema
 */
export const inferSchema = createInferValibotSchemaHelper();
