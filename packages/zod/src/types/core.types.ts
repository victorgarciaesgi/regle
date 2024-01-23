import { RegleStatus } from '@regle/core';
import { PartialDeep } from 'type-fest';
import { ComputedRef, Ref } from 'vue';
import { z } from 'zod';
import { toZod } from './zod.types';

export interface ZodRegle<TState extends Record<string, any>, TSchema extends toZod<any>> {
  $state: Ref<PartialDeep<TState>>;
  $regle: RegleStatus<TState, any>;
  /** Show active errors based on your behaviour options (lazy, autoDirty)
   * It allow you to skip scouting the `$regle` object
   */
  $errors: ZodToRegleErrorTree<TSchema>;
  $valid: ComputedRef<boolean>;
  $invalid: ComputedRef<boolean>;
  resetForm: () => void;
  // validateForm: () => Promise<false | DeepSafeFormState<TState, TSchema>>;
}

// Zod errors

export type ZodToRegleErrorTree<TSchema extends toZod<any>> =
  TSchema extends z.ZodObject<infer O>
    ? {
        readonly [K in keyof O]: ZodDefToRegleValidationErrors<O[K]>;
      }
    : never;

export type ZodDefToRegleValidationErrors<TRule extends z.ZodType<any, any, any>> =
  TRule extends z.ZodArray<infer A>
    ? ZodToRegleCollectionErrors<A>
    : TRule extends z.ZodObject<any>
      ? ZodToRegleErrorTree<TRule>
      : string[];

export type ZodToRegleCollectionErrors<TRule extends z.ZodTypeAny> = {
  readonly $errors: string[];
  readonly $each: ZodDefToRegleValidationErrors<TRule>[];
};
