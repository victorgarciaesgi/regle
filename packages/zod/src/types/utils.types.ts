import type { MaybeRef } from 'vue';
import type { z } from 'zod';

export type Prettify<T> = T extends infer R
  ? {
      [K in keyof R]: R[K];
    } & {}
  : never;

export type DeepReactiveState<T extends Record<string, any>> = {
  [K in keyof T]: MaybeRef<T[K]>;
};

export type GetNestedZodSchema<T extends z.ZodTypeAny> =
  T extends z.ZodDefault<infer D> ? GetNestedZodSchema<D> : T extends z.ZodCatch<infer C> ? GetNestedZodSchema<C> : T;
