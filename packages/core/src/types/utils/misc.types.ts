import type { MaybeRef, Ref, UnwrapNestedRefs, UnwrapRef } from 'vue';

export type Prettify<T> = T extends infer R
  ? {
      [K in keyof R]: R[K];
    } & {}
  : never;
export type Maybe<T = any> = T | null | undefined;
export type MaybeNull<T> = T | null;

export type MaybeGetter<T, V = any, TAdd extends Record<string, any> = {}> =
  | T
  | ((value: Ref<V>, index: number) => T & TAdd);

export type Unwrap<T extends MaybeRef<Record<string, any>>> = T extends Ref
  ? UnwrapRef<T>
  : UnwrapNestedRefs<T>;

export type ExtractFromGetter<T extends MaybeGetter<any, any, any>> =
  T extends MaybeGetter<infer U, any, any> ? U : never;

export type DeepMaybeRef<T extends Record<string, any>> = {
  [K in keyof T]: MaybeRef<T[K]>;
};

export type ExcludeByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K] extends U ? never : T[K];
};

export type PrimitiveTypes = string | number | boolean | bigint;

export type NonPresentKeys<
  TSource extends Record<string, any>,
  Target extends Record<string, any>,
> = Omit<Target, keyof TSource>;

export type NoInferLegacy<A extends any> = [A][A extends any ? 0 : never];
