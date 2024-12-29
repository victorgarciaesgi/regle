import type {
  RegleCollectionErrors,
  RegleCommonStatus,
  RegleErrorTree,
  RegleRuleStatus,
  RegleShortcutDefinition,
} from '@regle/core';
import type { PartialDeep } from 'type-fest';
import type { ArrayElement } from 'type-fest/source/internal';
import type * as v from 'valibot';
import type { MaybeArrayAsync, MaybeObjectAsync, MaybeSchemaAsync, ValibotObj } from './valibot.types';

export interface ValibotRegle<
  TState extends Record<string, any>,
  TSchema extends MaybeObjectAsync<any>,
  TShortcuts extends RegleShortcutDefinition = {},
> {
  r$: ValibotRegleStatus<TState, TSchema, TShortcuts>;
}

export type ValibotRegleResult<TSchema extends MaybeSchemaAsync<unknown>> =
  | { result: false; data: PartialDeep<v.InferOutput<TSchema>> }
  | { result: true; data: v.InferOutput<TSchema> };

/**
 * @public
 */
export type ValibotRegleStatus<
  TState extends Record<string, any> = Record<string, any>,
  TSchema extends MaybeObjectAsync<any> = MaybeObjectAsync<any>,
  TShortcuts extends RegleShortcutDefinition = {},
  TEntries = TSchema extends v.ObjectSchema<infer O, any>
    ? O
    : TSchema extends v.ObjectSchemaAsync<infer O, any>
      ? O
      : undefined,
> = RegleCommonStatus<TState> & {
  readonly $fields: {
    readonly [TKey in keyof TState]: TKey extends keyof TEntries
      ? TEntries[TKey] extends MaybeSchemaAsync<any>
        ? InferValibotRegleStatusType<TEntries[TKey], TState[TKey], TShortcuts>
        : never
      : ValibotRegleFieldStatus<undefined, TState[TKey], TShortcuts>;
  } & {
    readonly [TKey in keyof TState as TKey extends keyof TEntries
      ? TEntries[TKey] extends NonNullable<TEntries[TKey]>
        ? TKey
        : never
      : never]-?: TKey extends keyof TEntries
      ? TEntries[TKey] extends MaybeSchemaAsync<any>
        ? InferValibotRegleStatusType<TEntries[TKey], NonNullable<TState[TKey]>, TShortcuts>
        : never
      : never;
  };
  readonly $errors: RegleErrorTree<TState>;
  readonly $silentErrors: RegleErrorTree<TState>;
  $resetAll: () => void;
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
  $validate: () => Promise<ValibotRegleResult<TSchema>>;
} & ([TShortcuts['nested']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['nested']]: ReturnType<NonNullable<TShortcuts['nested']>[K]>;
      });

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
export type InferValibotRegleStatusType<
  TSchema extends MaybeSchemaAsync<any> | undefined,
  TState extends unknown,
  TShortcuts extends RegleShortcutDefinition = {},
> =
  InferSchema<TSchema> extends MaybeArrayAsync<infer A>
    ? ValibotRegleCollectionStatus<A, TState extends Array<any> ? TState : [], TShortcuts>
    : NonNullable<TState> extends Date | File
      ? ValibotRegleFieldStatus<InferSchema<TSchema>, TState, TShortcuts>
      : InferSchema<TSchema> extends MaybeObjectAsync<Record<string, any>>
        ? ValibotRegleStatus<TState extends Record<string, any> ? TState : {}, InferSchema<TSchema>, TShortcuts>
        : ValibotRegleFieldStatus<InferSchema<TSchema>, TState, TShortcuts>;

/**
 * @public
 */
export type ValibotRegleFieldStatus<
  TSchema extends MaybeSchemaAsync<any> | undefined,
  TState = any,
  TShortcuts extends RegleShortcutDefinition = {},
> = RegleCommonStatus<TState> & {
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
} & ([TShortcuts['fields']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['fields']]: ReturnType<NonNullable<TShortcuts['fields']>[K]>;
      });

/**
 * @public
 */
export type ValibotRegleCollectionStatus<
  TSchema extends MaybeSchemaAsync<any>,
  TState extends any[],
  TShortcuts extends RegleShortcutDefinition = {},
> = Omit<ValibotRegleFieldStatus<TSchema, TState>, '$errors' | '$silentErrors' | '$validate'> & {
  readonly $each: Array<InferValibotRegleStatusType<NonNullable<TSchema>, ArrayElement<TState>, TShortcuts>>;
  readonly $field: ValibotRegleFieldStatus<TSchema, TState>;
  readonly $errors: RegleCollectionErrors<TSchema>;
  readonly $silentErrors: RegleCollectionErrors<TSchema>;
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
  $validate: () => Promise<ValibotRegleResult<TSchema>>;
} & ([TShortcuts['collections']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['collections']]: ReturnType<NonNullable<TShortcuts['collections']>[K]>;
      });
