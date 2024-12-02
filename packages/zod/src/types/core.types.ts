import type { RegleCommonStatus, RegleRuleStatus } from '@regle/core';
import type { PartialDeep } from 'type-fest';
import type { z } from 'zod';
import type { toZod } from './zod.types';

export interface ZodRegle<TState extends Record<string, any>, TSchema extends toZod<any>> {
  r$: ZodRegleStatus<TState, TSchema>;
}

// - Zod errors

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

// - Zod status

type ZodRegleResult<TSchema extends toZod<any>> =
  | { result: false; data: PartialDeep<z.output<TSchema>> }
  | { result: true; data: z.output<TSchema> };

/**
 * @public
 */
export interface ZodRegleStatus<
  TState extends Record<string, any> = Record<string, any>,
  TSchema extends toZod<any> = toZod<any>,
> extends RegleCommonStatus<TState> {
  readonly $fields: TSchema extends z.ZodObject<infer O extends z.ZodRawShape>
    ? {
        readonly [TKey in keyof O]: O[TKey] extends z.ZodTypeAny
          ? InferZodRegleStatusType<O[TKey], TState, TKey>
          : never;
      }
    : never;
  readonly $errors: ZodToRegleErrorTree<TSchema>;
  readonly $silentErrors: ZodToRegleErrorTree<TSchema>;
  $resetAll: () => void;
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
  $validate: () => Promise<ZodRegleResult<TSchema>>;
}

/**
 * @public
 */
export type InferZodRegleStatusType<
  TSchema extends z.ZodTypeAny,
  TState extends Record<PropertyKey, any> = any,
  TKey extends PropertyKey = string,
> =
  TSchema extends z.ZodArray<infer A>
    ? ZodRegleCollectionStatus<A, TState[TKey]>
    : TSchema extends z.ZodObject<any>
      ? TState[TKey] extends Array<any>
        ? RegleCommonStatus<TState[TKey]>
        : ZodRegleStatus<TState[TKey], TSchema>
      : ZodRegleFieldStatus<TSchema, TState, TKey>;

/**
 * @public
 */
export interface ZodRegleFieldStatus<
  TSchema extends z.ZodTypeAny,
  TState extends Record<PropertyKey, any> = any,
  TKey extends PropertyKey = string,
> extends RegleCommonStatus<TState> {
  $value: TState[TKey];
  readonly $externalErrors?: string[];
  readonly $rules: {
    [Key in `${string & TSchema['_def']['typeName']}`]: RegleRuleStatus<TState[TKey], []>;
  };
  $validate: () => Promise<false | z.output<TSchema>>;
}

/**
 * @public
 */
export interface ZodRegleCollectionStatus<TSchema extends z.ZodTypeAny, TState extends any[]>
  extends ZodRegleFieldStatus<TSchema, TState> {
  readonly $each: Array<InferZodRegleStatusType<NonNullable<TSchema>, TState, number>>;
  $validate: () => Promise<false | z.output<TSchema>>;
}
