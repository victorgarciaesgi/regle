import { type Ref } from 'vue';
import type { z } from 'zod';

/**
 * Force dependency on any Zod schema
 * ```ts
 * const foo = ref('');
 * withDeps(
 *  z.string().refine((value) => value === foo.value)),
 *  [foo]
 * )
 * ```
 */
export function withDeps<TSchema extends z.ZodTypeAny, TParams extends (Ref<unknown> | (() => unknown))[] = []>(
  schema: TSchema,
  depsArray: [...TParams]
): TSchema & { __depsArray: TParams } {
  return { ...schema, __depsArray: depsArray };
}
