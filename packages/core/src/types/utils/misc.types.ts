import type { MaybeRef, Ref, UnwrapNestedRefs, UnwrapRef } from 'vue';
import type { RegleStatic, RegleStaticImpl } from './static.types';
import type { MaybeRefOrComputedRef } from './object.types';
import type { IsNullable, IsOptional, Or } from 'type-fest';

export type Prettify<T> = T extends infer R
  ? {
      [K in keyof R]: R[K];
    } & {}
  : never;

export type Maybe<T = any> = T | null | undefined;
export type MaybeInput<T = any> = T | null | undefined;
export type MaybeOutput<T = any> = T | undefined;
export type MaybeNull<T> = T | null;
export type MaybeReadonly<T> = T | Readonly<T>;
export type NonUndefined<T> = Exclude<T, undefined>;

export type MaybeNullable<T> = Or<IsNullable<T>, IsOptional<T>>;

export type PromiseReturn<T> = T extends Promise<infer U> ? U : T;

export type MaybeGetter<T, V = any, TAdd extends Record<string, any> = {}, TSelf extends Record<string, any> = {}> =
  | (T & TSelf)
  | ((value: Ref<V>, index: number) => T & TAdd & TSelf);

export type MaybeComputedOrGetter<T> = MaybeRefOrComputedRef<T> | ((...args: any[]) => T);

export type Unwrap<T extends MaybeRef<unknown>> = T extends Ref ? UnwrapRef<T> : UnwrapNestedRefs<T>;
export type UnwrapSimple<T extends MaybeRef<Record<string, any>>> =
  T extends MaybeComputedOrGetter<infer U>
    ? U
    : T extends Ref<infer U>
      ? U
      : T extends (...args: any[]) => infer U
        ? U
        : T;

export type ExtractFromGetter<T extends MaybeGetter<any, any, any>> = T extends ((
  value: Ref<any>,
  index: number
) => infer U extends Record<string, any>)
  ? U
  : T;

export type ExtendOnlyRealRecord<T extends unknown> =
  NonNullable<T> extends File | Date | RegleStatic<{}> | RegleStaticImpl<{}>
    ? false
    : NonNullable<T> extends Record<string, any>
      ? true
      : false;

export type OmitByType<T extends Record<string, any>, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K];
};

export type DeepMaybeRef<T extends Record<string, any>> = {
  [K in keyof T]: MaybeRef<T[K]>;
};

export type ExcludeByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K] extends U ? never : T[K];
};

export type PrimitiveTypes = string | number | boolean | bigint | Date | File;

export type isRecordLiteral<T extends unknown> =
  NonNullable<T> extends Date | File | RegleStatic<unknown> | RegleStaticImpl<unknown>
    ? false
    : NonNullable<T> extends Record<string, any>
      ? true
      : false;

export type NonPresentKeys<TSource extends Record<string, any>, Target extends Record<string, any>> = Omit<
  Target,
  keyof TSource
>;

export type NoInferLegacy<A extends any> = [A][A extends any ? 0 : never];
