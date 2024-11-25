import type { RegleCommonStatus, RegleExternalErrorTree, RegleRuleStatus } from '@regle/core';
import type { PartialDeep } from 'type-fest';
import type { ComputedRef, Ref } from 'vue';
import type { z } from 'zod';
import type { NonPresentKeys, toZod } from './zod.types';

export interface ZodRegle<
  TState extends Record<string, any>,
  TSchema extends toZod<any>,
  TExternal extends RegleExternalErrorTree<TState> = never,
> {
  state: Ref<PartialDeep<TState>>;
  r$: ZodRegleStatus<TState, TSchema, TExternal>;
  ready: ComputedRef<boolean>;
  resetAll: () => void;
  validateState: () => Promise<false | z.output<TSchema>>;
}

// - Zod errors

export type ZodToRegleErrorTree<
  TSchema extends toZod<any>,
  TExternal extends RegleExternalErrorTree<Record<string, unknown>> = never,
> =
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

/**
 * @public
 */
export interface ZodRegleStatus<
  TState extends Record<string, any> = Record<string, any>,
  TSchema extends toZod<any> = toZod<any>,
  TExternal extends RegleExternalErrorTree<TState> = never,
> extends RegleCommonStatus<TState> {
  readonly $fields: TSchema extends z.ZodObject<infer O extends z.ZodRawShape>
    ? {
        readonly [TKey in keyof O]: O[TKey] extends z.ZodTypeAny
          ? InferZodRegleStatusType<O[TKey], TState, TKey>
          : never;
      }
    : never;
  readonly $errors: ZodToRegleErrorTree<TSchema, TExternal>;
  readonly $silentErrors: ZodToRegleErrorTree<TSchema, TExternal>;
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
  // readonly $rules: {
  //   [`${TSchema}`]: RegleRuleStatus<TState[TKey], []> & TSchema['']
  // };
  readonly $rules: {
    [Key in `${string & TSchema['_def']['typeName']}`]: RegleRuleStatus<TState[TKey], []>;
  };
}

/**
 * @public
 */
export interface ZodRegleCollectionStatus<TSchema extends z.ZodTypeAny, TState extends any[]>
  extends ZodRegleFieldStatus<TSchema, TState> {
  readonly $each: Array<InferZodRegleStatusType<NonNullable<TSchema>, TState, number>>;
}
