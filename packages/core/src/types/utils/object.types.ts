import type { UnionToIntersection, UnionToTuple } from 'type-fest';
import type { isRecordLiteral, Prettify } from './misc.types';
import type { MaybeRef, Ref, UnwrapNestedRefs, UnwrapRef } from 'vue';
import type { DeepReactiveState } from '../core';

type RemoveCommonKey<T extends readonly any[], K extends PropertyKey> = T extends [infer F, ...infer R]
  ? [Prettify<Omit<F, K>>, ...RemoveCommonKey<R, K>]
  : [];

export type JoinDiscriminatedUnions<TUnion extends unknown> =
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
