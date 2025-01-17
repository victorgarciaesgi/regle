import type { z } from 'zod';

export type GetNestedZodSchema<T extends z.ZodTypeAny> =
  T extends z.ZodDefault<infer D> ? GetNestedZodSchema<D> : T extends z.ZodCatch<infer C> ? GetNestedZodSchema<C> : T;
