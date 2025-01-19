import type { DeepReactiveState, NoInferLegacy, PrimitiveTypes, Unwrap } from '@regle/core';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { PartialDeep } from 'type-fest';
import { type ComputedRef, type MaybeRef, type UnwrapNestedRefs } from 'vue';

export interface inferValibotSchemaFn {
  <
    TState extends Record<string, any>,
    TSchema extends StandardSchemaV1<Record<string, any>> & TValid,
    TValid = UnwrapNestedRefs<TState> extends PartialDeep<
      StandardSchemaV1.InferInput<TSchema>,
      { recurseIntoArrays: true }
    >
      ? {}
      : "[Schema input doesn't match the state]",
  >(
    state: MaybeRef<TState> | DeepReactiveState<TState> | undefined,
    rulesFactory: TSchema
  ): NoInferLegacy<TSchema>;
  <
    TState extends PrimitiveTypes,
    TSchema extends StandardSchemaV1 & TValid,
    TValid = TState extends StandardSchemaV1.InferInput<TSchema> ? {} : "[Schema input doesn't match the state]",
  >(
    state: MaybeRef<TState>,
    rulesFactory: TSchema
  ): NoInferLegacy<TSchema>;
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
