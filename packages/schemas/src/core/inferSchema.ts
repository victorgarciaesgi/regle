import type { DeepReactiveState, MaybeInput, MismatchInfo, NoInferLegacy, PrimitiveTypes } from '@regle/core';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { PartialDeep } from 'type-fest';
import { type ComputedRef, type MaybeRef, type UnwrapNestedRefs } from 'vue';

export interface inferSchemaFn {
  <TSchema extends StandardSchemaV1, TState extends StandardSchemaV1.InferInput<TSchema> | undefined>(
    state:
      | MaybeRef<PartialDeep<TState, { recurseIntoArrays: true }>>
      | DeepReactiveState<PartialDeep<TState, { recurseIntoArrays: true }>>,
    rulesFactory: MaybeRef<TSchema>
  ): NoInferLegacy<TSchema>;
}

export function createInferSchemaHelper(): inferSchemaFn {
  function inferSchema(
    state: Record<string, any>,
    rulesFactory: Record<string, any> | (() => Record<string, any>) | ComputedRef<Record<string, any>>
  ) {
    return rulesFactory;
  }
  return inferSchema as any;
}

/**
 * Rule type helper to provide autocomplete and typecheck to your form rules or part of your form rules
 * It will just return the rules without any processing.
 *
 * @param state - The state reference
 * @param schema - Your schema
 */
export const inferSchema = createInferSchemaHelper();
