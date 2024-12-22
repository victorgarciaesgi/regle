import type { RegleCollectionErrors, RegleCommonStatus, RegleErrorTree, RegleRuleStatus } from '@regle/core';
import type { PartialDeep } from 'type-fest';
import type { ArrayElement } from 'type-fest/source/internal';
import type * as v from 'valibot';
import type { MaybeArrayAsync, MaybeObjectAsync, MaybeSchemaAsync, ValibotObj } from './valibot.types';

export interface ValibotRegle<TState extends Record<string, any>, TSchema extends MaybeObjectAsync<any>> {
  r$: ValibotRegleStatus<TState, TSchema>;
}

export type ValibotRegleResult<TSchema extends MaybeSchemaAsync<unknown>> =
  | { result: false; data: PartialDeep<v.InferOutput<TSchema>> }
  | { result: true; data: v.InferOutput<TSchema> };

/**
 * @public
 */
export interface ValibotRegleStatus<
  TState extends Record<string, any> = Record<string, any>,
  TSchema extends MaybeObjectAsync<any> = MaybeObjectAsync<any>,
  TEntries = TSchema extends v.ObjectSchema<infer O, any>
    ? O
    : TSchema extends v.ObjectSchemaAsync<infer O, any>
      ? O
      : undefined,
> extends RegleCommonStatus<TState> {
  readonly $fields: {
    readonly [TKey in keyof TState]: TKey extends keyof TEntries
      ? TEntries[TKey] extends MaybeSchemaAsync<any>
        ? InferValibotRegleStatusType<TEntries[TKey], TState[TKey]>
        : never
      : ValibotRegleFieldStatus<undefined, TState[TKey]>;
  } & {
    readonly [TKey in keyof TState as TKey extends keyof TEntries
      ? TEntries[TKey] extends NonNullable<TEntries[TKey]>
        ? TKey
        : never
      : never]-?: TKey extends keyof TEntries
      ? TEntries[TKey] extends MaybeSchemaAsync<any>
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

type InferSchema<T> =
  T extends v.SchemaWithPipe<[infer U extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>, ...any[]]>
    ? U
    : T extends v.SchemaWithPipeAsync<
          [infer U extends v.BaseSchemaAsync<unknown, unknown, v.BaseIssue<unknown>>, ...any[]]
        >
      ? U
      : T extends MaybeSchemaAsync<any>
        ? T
        : undefined;

/**
 * @public
 */
export type InferValibotRegleStatusType<TSchema extends MaybeSchemaAsync<any> | undefined, TState extends unknown> =
  InferSchema<TSchema> extends MaybeArrayAsync<infer A>
    ? ValibotRegleCollectionStatus<A, TState extends Array<any> ? TState : []>
    : NonNullable<TState> extends Date | File
      ? ValibotRegleFieldStatus<InferSchema<TSchema>, TState>
      : InferSchema<TSchema> extends MaybeObjectAsync<Record<string, any>>
        ? ValibotRegleStatus<TState extends Record<string, any> ? TState : {}, InferSchema<TSchema>>
        : ValibotRegleFieldStatus<InferSchema<TSchema>, TState>;

/**
 * @public
 */
export interface ValibotRegleFieldStatus<TSchema extends MaybeSchemaAsync<any> | undefined, TState = any>
  extends RegleCommonStatus<TState> {
  readonly $externalErrors?: string[];
  readonly $errors: string[];
  readonly $silentErrors: string[];
  readonly $rules: TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
    ? {
        [Key in `${string & TSchema['type']}`]: RegleRuleStatus<TState, []>;
      }
    : {};
  $validate: () => Promise<
    ValibotRegleResult<
      TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
        ? TSchema
        : v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
    >
  >;
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
}

/**
 * @public
 */
export interface ValibotRegleCollectionStatus<TSchema extends MaybeSchemaAsync<any>, TState extends any[]>
  extends Omit<ValibotRegleFieldStatus<TSchema, TState>, '$errors' | '$silentErrors' | '$validate'> {
  readonly $each: Array<InferValibotRegleStatusType<NonNullable<TSchema>, ArrayElement<TState>>>;
  readonly $field: ValibotRegleFieldStatus<TSchema, TState>;
  readonly $errors: RegleCollectionErrors<TSchema>;
  readonly $silentErrors: RegleCollectionErrors<TSchema>;
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
  $validate: () => Promise<ValibotRegleResult<TSchema>>;
}
