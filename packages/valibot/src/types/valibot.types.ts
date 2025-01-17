import type { Maybe } from '@regle/core';
import type * as v from 'valibot';
import type { IsAny } from 'type-fest';

export type ValibotObj<T extends Record<string, unknown>> = {
  readonly [K in keyof Partial<T>]: ValibotChild<IsAny<T[K]> extends true ? unknown : T[K]>;
};

export type ValibotObjWithoutAsync<T extends Record<string, unknown>> = {
  readonly [K in keyof Partial<T>]: ValibotChildWithoutAsync<IsAny<T[K]> extends true ? unknown : T[K]>;
};

export type ValibotChild<TValue extends unknown> =
  TValue extends Array<infer A extends unknown>
    ? MaybeArrayAsync<ValibotChild<A>>
    : TValue extends Date | File
      ? MaybeSchemaAsync<Maybe<Date | File>>
      : TValue extends Record<PropertyKey, any>
        ? MaybeObjectAsync<TValue>
        : MaybeSchemaAsync<Maybe<TValue>>;

export type ValibotChildWithoutAsync<TValue extends unknown> =
  TValue extends Array<infer A extends unknown>
    ? v.ArraySchema<ValibotChildWithoutAsync<A>, any>
    : TValue extends Date | File
      ? v.BaseSchema<Maybe<Date | File>, Maybe<Date | File>, v.BaseIssue<unknown>>
      : TValue extends Record<PropertyKey, any>
        ? v.ObjectSchema<ValibotObjWithoutAsync<TValue>, any>
        : v.BaseSchema<Maybe<TValue>, Maybe<TValue>, v.BaseIssue<unknown>>;

export type MaybeSchemaAsync<T> =
  | v.BaseSchema<Maybe<T>, Maybe<T>, v.BaseIssue<unknown>>
  | v.BaseSchemaAsync<Maybe<T>, Maybe<T>, v.BaseIssue<unknown>>
  | v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>;

export type MaybeInputObjectAsync<T extends Record<string, unknown>> =
  | v.BaseSchema<v.InferObjectInput<ValibotObjWithoutAsync<T>>, any, v.BaseIssue<unknown>>
  | v.BaseSchemaAsync<v.InferObjectInput<ValibotObjWithoutAsync<T>>, any, v.BaseIssue<unknown>>;

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
export type toValibot<T extends Record<string, unknown>> = MaybeInputObjectAsync<T>;

type test = toValibot<{
  level0: number;
  level1: {
    child: number;
    level2: {
      child: number;
    };
    collection: {
      name: number | undefined;
    }[];
  };
}>;
