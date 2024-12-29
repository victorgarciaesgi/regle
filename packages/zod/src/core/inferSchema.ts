import { ref, type ComputedRef, type MaybeRef } from 'vue';
import type { DeepReactiveState, toZod, ZodChild } from '../types';
import type { NoInferLegacy, PrimitiveTypes, RegleRuleDecl, Unwrap } from '@regle/core';

export interface inferZodSchemaFn {
  <TState extends Record<string, any>, TZodSchema extends toZod<Unwrap<TState>> = toZod<Unwrap<TState>>>(
    state: MaybeRef<TState> | DeepReactiveState<TState> | undefined,
    rulesFactory: TZodSchema
  ): NoInferLegacy<TZodSchema>;
  <TState extends PrimitiveTypes, TZodSchema extends ZodChild<TState> = ZodChild<TState>>(
    state: MaybeRef<TState>,
    rulesFactory: TZodSchema
  ): NoInferLegacy<TZodSchema>;
}

export function createInferZodSchemaHelper(): inferZodSchemaFn {
  function inferRules(
    state: Record<string, any>,
    rulesFactory: Record<string, any> | (() => Record<string, any>) | ComputedRef<Record<string, any>>
  ) {
    return rulesFactory;
  }
  return inferRules as any;
}

export const inferSchema = createInferZodSchemaHelper();
