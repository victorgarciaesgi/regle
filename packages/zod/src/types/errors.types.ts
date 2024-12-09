import type { z } from 'zod';
import type { toZod } from './zod.types';

export type ZodToRegleErrorTree<TSchema extends toZod<any>> =
  TSchema extends z.ZodObject<infer O>
    ? {
        readonly [K in keyof O]: ZodDefToRegleValidationErrors<O[K]>;
      }
    : never;

export type ZodDefToRegleValidationErrors<TRule extends z.ZodTypeAny> =
  TRule extends z.ZodArray<infer A>
    ? ZodToRegleCollectionErrors<A>
    : TRule extends z.ZodObject<any>
      ? ZodToRegleErrorTree<TRule>
      : string[];

export type ZodToRegleCollectionErrors<TRule extends z.ZodTypeAny> = {
  readonly $errors: string[];
  readonly $each: ZodDefToRegleValidationErrors<TRule>[];
};
