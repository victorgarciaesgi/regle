import type { StandardSchemaV1 } from '@standard-schema/spec';
import { type Ref } from 'vue';

/**
 * ⚠️ Not compatible with `schema` mode
 *
 * Force dependency on any RPC schema
 * ```ts
 * const foo = ref('');
 *
 * useRegleSchema({name: ''}, v.object({
 *    name: withDeps(
 *       v.pipe(v.string(), v.check((value) => value === foo.value)),
 *       [foo]
 *    )
 * }))
 * ```
 */
export function withDeps<TSchema extends StandardSchemaV1, TParams extends (Ref<unknown> | (() => unknown))[] = []>(
  schema: TSchema,
  depsArray: [...TParams]
): TSchema & { __depsArray: TParams } {
  if (!Object.hasOwn(schema, '__depsArray')) {
    Object.defineProperties(schema, {
      __depsArray: {
        value: depsArray,
        enumerable: false,
        configurable: false,
        writable: false,
      },
    });
  }
  return schema as any;
}
