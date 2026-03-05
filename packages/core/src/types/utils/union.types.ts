import type { EmptyObject, IsAny, IsUnknown, UnionToIntersection, UnionToTuple } from 'type-fest';
import type { isRecordLiteral, NonUndefined, Prettify } from './misc.types';
import type { HasNamedKeys } from './object.types';

/**
 * Combine all members of a union type, merging types for each key, and keeping loose types
 */
export type JoinDiscriminatedUnions<TUnion extends unknown> =
  IsAny<TUnion> extends true
    ? any
    : IsUnknown<TUnion> extends true
      ? any
      : HasNamedKeys<TUnion> extends true
        ? isRecordLiteral<TUnion> extends true
          ? NonNullable<TUnion> extends infer TNonNull
            ? NormalizeUnion<TNonNull> extends infer TNormalized extends Record<string, any>
              ? HasCommonKey<UnionToTuple<TNonNull>, keyof TNormalized> extends true
                ? ResolveKeys<TUnion> extends infer TResolved extends Record<string, any>
                  ? DumbJoinDiscriminatedUnions<TUnion> extends infer TDumbJoin
                    ? Omit<TDumbJoin, keyof TResolved> extends infer TLoose
                      ? Prettify<TResolved & (TLoose extends EmptyObject ? {} : TLoose)>
                      : never
                    : never
                  : never
                : DumbJoinDiscriminatedUnions<TUnion>
              : never
            : never
          : TUnion
        : TUnion;

type ResolveKeys<TUnion extends unknown> =
  NonNullable<TUnion> extends infer TNonNull
    ? NormalizeUnion<TNonNull> extends infer TNormalized extends Record<string, any>
      ? Partial<UnionToIntersection<RemoveCommonKey<UnionToTuple<TNonNull>, keyof TNormalized>[number]>> &
          Pick<TNormalized, keyof TNormalized>
      : never
    : never;

/**
 * Combine all members of a union type on one level and not nested.
 */
export type LazyJoinDiscriminatedUnions<TUnion extends unknown> =
  IsAny<TUnion> extends true
    ? any
    : IsUnknown<TUnion> extends true
      ? any
      : isRecordLiteral<TUnion> extends true
        ? NonNullable<TUnion> extends infer TNonNull extends Record<string, any>
          ? Prettify<
              Partial<UnionToIntersection<RemoveCommonKey<UnionToTuple<TNonNull>, keyof TNonNull>[number]>> &
                Pick<TNonNull, keyof TNonNull>
            >
          : never
        : TUnion;

export type DumbJoinDiscriminatedUnions<TUnion extends unknown> =
  IsAny<TUnion> extends true
    ? any
    : IsUnknown<TUnion> extends true
      ? any
      : isRecordLiteral<TUnion> extends true
        ? NonNullable<TUnion> extends infer TNonNull extends Record<string, any>
          ? Prettify<Partial<UnionToIntersection<TNonNull>> & Pick<TNonNull, keyof TNonNull>>
          : never
        : TUnion;

type RemoveCommonKey<T extends readonly any[], K extends PropertyKey> = T extends [infer F, ...infer R]
  ? [Prettify<Omit<F, K>>, ...RemoveCommonKey<R, K>]
  : [];

type HasCommonKey<T extends readonly any[], K extends PropertyKey> = T extends [infer F, ...infer R]
  ? K extends keyof F
    ? true
    : HasCommonKey<R, K>
  : false;

/**
 * Transforms a union and apply undefined values to non-present keys to support intersection
 */
type NormalizeUnion<TUnion> = RetrieveUnionUnknownValues<
  NonNullable<UnionToTuple<TUnion>>,
  RetrieveUnionUnknownKeysOf<NonNullable<UnionToTuple<TUnion>>>[number]
>[number];

/**
 * Combine all union values to be able to get even the normally "never" values, act as an intersection type
 */
type RetrieveUnionUnknownValues<T extends readonly any[], TKeys extends string> = T extends [
  infer F extends Record<string, any>,
  ...infer R,
]
  ? [
      {
        [K in TKeys as GetMaybeObjectValue<F, K> extends NonUndefined<GetMaybeObjectValue<F, K>>
          ? never
          : K]?: GetMaybeObjectValue<F, K>;
      } & {
        [K in TKeys as GetMaybeObjectValue<F, K> extends NonUndefined<GetMaybeObjectValue<F, K>>
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
 * Get item value from object, otherwise fallback to undefined. Avoid TS to not be able to infer keys not present on all unions
 */
type GetMaybeObjectValue<O extends Record<string, any>, K extends string> = K extends keyof O ? O[K] : undefined;
