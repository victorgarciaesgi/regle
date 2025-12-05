import type { StandardSchemaV1 } from '@standard-schema/spec';

/**
 * Force a schema validation to re-run when specified dependencies change.
 * Useful when your schema depends on reactive values that aren't automatically tracked.
 *
 * @param schema - The Standard Schema to wrap
 * @param _depsArray - Array of reactive dependencies (their values will trigger re-validation)
 * @returns The same schema (passthrough)
 *
 * @example
 * ```ts
 * import { withDeps, useRegleSchema } from '@regle/schemas';
 * import * as v from 'valibot';
 *
 * const compareValue = ref('');
 *
 * const schema = computed(() => v.object({
 *   name: withDeps(
 *     v.pipe(
 *       v.string(),
 *       v.check((value) => value === compareValue.value)
 *     ),
 *     [compareValue.value] // Re-validate when this changes
 *   )
 * }));
 *
 * const { r$ } = useRegleSchema({ name: '' }, schema);
 * ```
 *
 * @see {@link https://reglejs.dev/integrations/schemas-libraries Documentation}
 */
export function withDeps<TSchema extends StandardSchemaV1, TParams extends unknown[] = []>(
  schema: TSchema,
  _depsArray: [...TParams]
): TSchema {
  return schema;
}
