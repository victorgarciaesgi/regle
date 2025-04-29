import type { UnionToIntersection, UnionToTuple } from 'type-fest';
import type { isRecordLiteral, Prettify } from './misc.types';
import type { MaybeRef, Ref, UnwrapNestedRefs, UnwrapRef } from 'vue';
import type { DeepReactiveState } from '../core';

type RemoveCommonKey<T extends readonly any[], K extends PropertyKey> = T extends [infer F, ...infer R]
  ? [Prettify<Omit<F, K>>, ...RemoveCommonKey<R, K>]
  : [];

/**
 * Restore the optional properties (with ?) of a generated mapped object type
 */
export type RestoreOptionalProperties<TObject extends Record<string, any>> = {
  [K in keyof TObject as TObject[K] extends NonNullable<TObject[K]> ? K : never]: TObject[K];
} & {
  [K in keyof TObject as TObject[K] extends NonNullable<TObject[K]> ? never : K]?: TObject[K];
};

/**
 * Get item value from object, otherwise fallback to undefined. Avoid TS to not be able to infer keys not present on all unions
 */
type GetMaybeObjectValue<O extends Record<string, any>, K extends string> = K extends keyof O ? O[K] : undefined;

/**
 * Combine all union values to be able to get even the normally "never" values, act as an intersection type
 */
type RetrieveUnionUnknownValues<T extends readonly any[], TKeys extends string> = T extends [
  infer F extends Record<string, any>,
  ...infer R,
]
  ? [
      {
        [K in TKeys as GetMaybeObjectValue<F, K> extends NonNullable<GetMaybeObjectValue<F, K>>
          ? never
          : K]?: GetMaybeObjectValue<F, K>;
      } & {
        [K in TKeys as GetMaybeObjectValue<F, K> extends NonNullable<GetMaybeObjectValue<F, K>>
          ? K
          : never]: GetMaybeObjectValue<F, K>;
      },
      ...RetrieveUnionUnknownValues<R, TKeys>,
    ]
  : [];

/**
 * Get all possible keys from a union, even the ones present only on one union
 */
type RetrieveUnionUnknownKeysOf<T extends readonly any[]> = T extends [infer F, ...infer R]
  ? [keyof F, ...RetrieveUnionUnknownKeysOf<R>]
  : [];

/**
 * Transforms a union and apply undefined values to non-present keys to support intersection
 */
type NormalizeUnion<TUnion> = RetrieveUnionUnknownValues<
  NonNullable<UnionToTuple<TUnion>>,
  RetrieveUnionUnknownKeysOf<NonNullable<UnionToTuple<TUnion>>>[number]
>[number];

/**
 * Combine all members of a union type, merging types for each key, and keeping loose types
 */
export type JoinDiscriminatedUnions<TUnion extends unknown> =
  isRecordLiteral<TUnion> extends true
    ? Prettify<
        Partial<UnionToIntersection<RemoveCommonKey<UnionToTuple<TUnion>, keyof NormalizeUnion<TUnion>>[number]>> &
          Pick<NormalizeUnion<TUnion>, keyof NormalizeUnion<TUnion>>
      >
    : TUnion;

export type LazyJoinDiscriminatedUnions<TUnion extends unknown> =
  isRecordLiteral<TUnion> extends true
    ? Prettify<
        Partial<UnionToIntersection<RemoveCommonKey<UnionToTuple<TUnion>, keyof NonNullable<TUnion>>[number]>> &
          Pick<NonNullable<TUnion>, keyof NonNullable<TUnion>>
      >
    : TUnion;

export type EnumLike = {
  [k: string]: string | number;
  [nu: number]: string;
};

export type enumType<T extends Record<string, unknown>> = T[keyof T];

export type UnwrapMaybeRef<T extends MaybeRef<any> | DeepReactiveState<any>> =
  T extends Ref<any> ? UnwrapRef<T> : UnwrapNestedRefs<T>;

export type TupleToPlainObj<T> = { [I in keyof T & `${number}`]: T[I] };
