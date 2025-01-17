import type { DeepReactiveState, NoInferLegacy, PrimitiveTypes, Unwrap } from '@regle/core';
import { type ComputedRef, type MaybeRef } from 'vue';
import type { toZod, ZodChild } from '../types';

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

/**
 * Rule type helper to provide autocomplete and typecheck to your form rules or part of your form rules
 * It will just return the rules without any processing.
 *
 * @param state - The state reference
 * @param schema - Your zod schema
 */
export const inferSchema = createInferZodSchemaHelper();
