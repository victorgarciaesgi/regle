import { type Ref } from 'vue';
import type { z } from 'zod';

export function withDeps<TSchema extends z.ZodTypeAny, TParams extends (Ref<unknown> | (() => unknown))[] = []>(
  schema: TSchema,
  depsArray: [...TParams]
): TSchema & { __depsArray: TParams } {
  return { ...schema, __depsArray: depsArray };
}
