import type { MaybeRef } from 'vue';

export type Prettify<T> = T extends infer R
  ? {
      [K in keyof R]: R[K];
    } & {}
  : never;
export type Maybe<T = any> = T | null | undefined;
export type MaybeNull<T> = T | null;

export type DeepMaybeRef<T extends Record<string, any>> = {
  [K in keyof T]: MaybeRef<T[K]>;
};

export type ExcludeByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K] extends U ? never : T[K];
};

export type PrimitiveTypes = string | number | boolean | bigint;
