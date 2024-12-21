import type { RegleCollectionErrors, RegleCommonStatus, RegleErrorTree, RegleRuleStatus } from '@regle/core';
import type { PartialDeep } from 'type-fest';
import type { z } from 'zod';
import type { toZod } from './zod.types';

export interface ZodRegle<TState extends Record<string, any>, TSchema extends toZod<any>> {
  r$: ZodRegleStatus<TState, TSchema>;
}

export type ZodRegleResult<TSchema extends toZod<any>> =
  | { result: false; data: PartialDeep<z.output<TSchema>> }
  | { result: true; data: z.output<TSchema> };

/**
 * @public
 */
export interface ZodRegleStatus<
  TState extends Record<string, any> = Record<string, any>,
  TSchema extends toZod<any> = toZod<TState>,
> extends RegleCommonStatus<TState> {
  readonly $fields: TSchema extends z.ZodObject<infer O extends z.ZodRawShape>
    ? keyof TState extends keyof O
      ? {
          readonly [TKey in keyof TState]: O[TKey] extends z.ZodTypeAny
            ? InferZodRegleStatusType<O[TKey], TState, TKey>
            : never;
        } & {
          readonly [TKey in keyof TState as O[TKey] extends NonNullable<O[TKey]>
            ? TKey
            : never]-?: InferZodRegleStatusType<NonNullable<O[TKey]>, NonNullable<TState>, TKey>;
        }
      : {}
    : {};
  readonly $errors: RegleErrorTree<TState>;
  readonly $silentErrors: RegleErrorTree<TState>;
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
      : ZodRegleFieldStatus<TSchema, TState[TKey], TKey>;

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
  readonly $errors: string[];
  readonly $silentErrors: string[];
  readonly $rules: {
    [Key in `${string & TSchema['_def']['typeName']}`]: RegleRuleStatus<TState[TKey], []>;
  };
  $validate: () => Promise<false | z.output<TSchema>>;
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
}

/**
 * @public
 */
export interface ZodRegleCollectionStatus<TSchema extends z.ZodTypeAny, TState extends any[]>
  extends Omit<ZodRegleFieldStatus<TSchema, TState>, '$errors' | '$silentErrors' | '$value'> {
  $value: TState;
  readonly $each: Array<InferZodRegleStatusType<NonNullable<TSchema>, TState, number>>;
  readonly $field: ZodRegleFieldStatus<TSchema, TState>;
  readonly $errors: RegleCollectionErrors<TState>;
  readonly $silentErrors: RegleCollectionErrors<TState>;
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
  $validate: () => Promise<false | z.output<TSchema>>;
}
