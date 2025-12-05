import type { DeepPartial, DeepReactiveState, NoInferLegacy } from '@regle/core';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import { type ComputedRef, type MaybeRef } from 'vue';

export interface inferSchemaFn {
  <TSchema extends StandardSchemaV1, TState extends StandardSchemaV1.InferInput<TSchema> | undefined>(
    state: MaybeRef<DeepPartial<TState>> | DeepReactiveState<DeepPartial<TState>>,
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
 * Type helper to provide autocomplete and type-checking for your schema.
 * Returns the schema without any processing - useful with computed schemas.
 *
 * @param state - The state reference
 * @param schema - Your Standard Schema (Zod, Valibot, ArkType, etc.)
 * @returns The schema (passthrough)
 *
 * @example
 * ```ts
 * import { inferSchema, useRegleSchema } from '@regle/schemas';
 * import { z } from 'zod';
 *
 * const state = ref({ name: '' });
 *
 * // inferSchema preserves TypeScript autocompletion
 * const schema = computed(() => {
 *   return inferSchema(state, z.object({
 *     name: z.string().min(2)
 *   }));
 * });
 *
 * const { r$ } = useRegleSchema(state, schema);
 * ```
 *
 * @see {@link https://reglejs.dev/integrations/schemas-libraries Documentation}
 */
export const inferSchema = createInferSchemaHelper();
