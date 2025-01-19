import type { StandardSchemaV1 } from '@standard-schema/spec';
import { type Ref } from 'vue';

/**
 * Force dependency on any Valibot schema
 * ```ts
 * const foo = ref('');
 * withDeps(
 *  v.pipe(v.string(), v.check((value) => value === foo.value)),
 *  [foo]
 * )
 * ```
 */
export function withDeps<TSchema extends StandardSchemaV1, TParams extends (Ref<unknown> | (() => unknown))[] = []>(
  schema: TSchema,
  depsArray: [...TParams]
): TSchema & { __depsArray: TParams } {
  return { ...schema, __depsArray: depsArray };
}
