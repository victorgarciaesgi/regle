import type { RegleCollectionErrors, RegleCommonStatus, RegleErrorTree, RegleRuleStatus } from '@regle/core';
import type { PartialDeep } from 'type-fest';
import type * as v from 'valibot';
import type { toValibot } from './valibot.types';

export interface ValibotRegle<TState extends Record<string, any>, TSchema extends toValibot<any>> {
  r$: ValibotRegleStatus<TState, TSchema>;
}

export type ValibotRegleResult<TSchema extends toValibot<any>> =
  | { result: false; data: PartialDeep<v.InferOutput<TSchema>> }
  | { result: true; data: v.InferOutput<TSchema> };

/**
 * @public
 */
export interface ValibotRegleStatus<
  TState extends Record<string, any> = Record<string, any>,
  TSchema extends toValibot<any> = toValibot<TState>,
  TEntries = TSchema extends v.ObjectSchema<infer O extends v.ObjectEntries, any> ? O : undefined,
> extends RegleCommonStatus<TState> {
  readonly $fields: {
    readonly [TKey in keyof TState]: TKey extends keyof TEntries
      ? TEntries[TKey] extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
        ? InferValibotRegleStatusType<TEntries[TKey], TState[TKey]>
        : never
      : ValibotRegleFieldStatus<undefined, TState[TKey]>;
  } & {
    readonly [TKey in keyof TState as TKey extends keyof TEntries
      ? TEntries[TKey] extends NonNullable<TEntries[TKey]>
        ? TKey
        : never
      : never]-?: TKey extends keyof TEntries
      ? TEntries[TKey] extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
        ? InferValibotRegleStatusType<TEntries[TKey], NonNullable<TState[TKey]>>
        : never
      : never;
  };
  readonly $errors: RegleErrorTree<TState>;
  readonly $silentErrors: RegleErrorTree<TState>;
  $resetAll: () => void;
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
  $validate: () => Promise<ValibotRegleResult<TSchema>>;
}

type InferSchema<T extends v.BaseSchema<any, any, v.BaseIssue<unknown>> | undefined> =
  T extends v.SchemaWithPipe<
    [
      infer U extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
      ...v.PipeItem<any, unknown, v.BaseIssue<unknown>>[],
    ]
  >
    ? U
    : T extends v.BaseSchema<any, any, v.BaseIssue<unknown>>
      ? T
      : undefined;

/**
 * @public
 */
export type InferValibotRegleStatusType<
  TSchema extends v.BaseSchema<any, any, v.BaseIssue<unknown>> | undefined,
  TState extends unknown,
> =
  InferSchema<TSchema> extends v.ArraySchema<infer A extends v.BaseSchema<any, any, v.BaseIssue<unknown>>, any>
    ? ValibotRegleCollectionStatus<A, TState extends Array<any> ? TState : []>
    : NonNullable<TState> extends Date | File
      ? ValibotRegleFieldStatus<InferSchema<TSchema>, TState>
      : InferSchema<TSchema> extends v.ObjectSchema<any, any>
        ? NonNullable<TState> extends Array<infer U>
          ? RegleCommonStatus<U>
          : ValibotRegleStatus<TState extends Record<string, any> ? TState : {}, InferSchema<TSchema>>
        : ValibotRegleFieldStatus<InferSchema<TSchema>, TState>;

/**
 * @public
 */
export interface ValibotRegleFieldStatus<
  TSchema extends v.BaseSchema<any, any, v.BaseIssue<unknown>> | undefined,
  TState = any,
> extends RegleCommonStatus<TState> {
  readonly $externalErrors?: string[];
  readonly $errors: string[];
  readonly $silentErrors: string[];
  readonly $rules: TSchema extends v.BaseSchema<any, any, v.BaseIssue<unknown>>
    ? {
        [Key in `${string & TSchema['type']}`]: RegleRuleStatus<TState, []>;
      }
    : {};
  $validate: () => Promise<
    false | (TSchema extends v.BaseSchema<any, any, v.BaseIssue<unknown>> ? v.InferOutput<TSchema> : {})
  >;
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
}

/**
 * @public
 */
export interface ValibotRegleCollectionStatus<
  TSchema extends v.BaseSchema<any, any, v.BaseIssue<unknown>>,
  TState extends any[],
> extends Omit<ValibotRegleFieldStatus<TSchema, TState>, '$errors' | '$silentErrors' | '$value'> {
  $value: TState;
  readonly $each: Array<InferValibotRegleStatusType<NonNullable<TSchema>, TState>>;
  readonly $field: ValibotRegleFieldStatus<TSchema, TState>;
  readonly $errors: RegleCollectionErrors<TSchema>;
  readonly $silentErrors: RegleCollectionErrors<TSchema>;
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
  $validate: () => Promise<false | v.InferOutput<TSchema>>;
}
