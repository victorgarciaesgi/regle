import { MaybeRef } from 'vue';

export type Maybe<T> = T | null | undefined;
export type MaybeNull<T> = T | null;

export type DeepMaybeRef<T extends Record<string, any>> = {
  [K in keyof T]: MaybeRef<T[K]>;
};
