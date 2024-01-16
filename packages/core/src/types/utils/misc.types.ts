import { MaybeRef } from 'vue';

export type Maybe<T> = T | null | undefined;
export type MaybeNull<T> = T | null;

export type DeepMaybeRef<T extends Record<string, any>> = {
  [K in keyof T]: MaybeRef<T[K]>;
};

export type ExcludeByType<T, U> = {
  [K in keyof T as T[K] extends U ? never : K]: T[K] extends U ? never : T[K];
};
