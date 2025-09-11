import type { StandardSchemaV1 } from '@standard-schema/spec';

/**
 *
 * Force dependency on any RPC schema
 * ```ts
 * const foo = ref('');
 *
 * const schema = computed(() => v.object({
 *    name: withDeps(
 *       v.pipe(v.string(), v.check((value) => value === foo.value)),
 *       [foo.value]
 *    )
 * }))
 *
 * useRegleSchema({name: ''}, schema)
 * ```
 */
export function withDeps<TSchema extends StandardSchemaV1, TParams extends unknown[] = []>(
  schema: TSchema,
  _depsArray: [...TParams]
): TSchema {
  return schema;
}
