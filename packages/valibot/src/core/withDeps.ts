import { type Ref } from 'vue';
import type { MaybeSchemaAsync } from '../types';

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
export function withDeps<
  TSchema extends MaybeSchemaAsync<any>,
  TParams extends (Ref<unknown> | (() => unknown))[] = [],
>(schema: TSchema, depsArray: [...TParams]): TSchema & { __depsArray: TParams } {
  return { ...schema, __depsArray: depsArray };
}
