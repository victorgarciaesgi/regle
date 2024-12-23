import { type Ref } from 'vue';
import type { MaybeSchemaAsync } from '../types';

export function withDeps<
  TSchema extends MaybeSchemaAsync<any>,
  TParams extends (Ref<unknown> | (() => unknown))[] = [],
>(schema: TSchema, depsArray: [...TParams]): TSchema & { __depsArray: TParams } {
  return { ...schema, __depsArray: depsArray };
}
