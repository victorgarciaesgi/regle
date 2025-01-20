import type { Maybe } from '@regle/core';
import type * as v from 'valibot';

export type MaybeSchemaAsync<T> =
  | v.BaseSchema<Maybe<T>, Maybe<T>, v.BaseIssue<unknown>>
  | v.BaseSchemaAsync<Maybe<T>, Maybe<T>, v.BaseIssue<unknown>>
  | v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;

export type MaybeObjectAsync<T extends v.ObjectEntries | v.ObjectEntriesAsync> =
  | v.BaseSchema<v.InferObjectInput<T>, any, any>
  | v.BaseSchemaAsync<v.InferObjectInput<T>, any, any>;

export type MaybeArrayAsync<A extends MaybeSchemaAsync<unknown>> =
  | v.ArraySchema<
      A extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>> ? A : any,
      v.ErrorMessage<v.ArrayIssue> | undefined
    >
  | v.ArraySchemaAsync<A, v.ErrorMessage<v.ArrayIssue> | undefined>;

//
