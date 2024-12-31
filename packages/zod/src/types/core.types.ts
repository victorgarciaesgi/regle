import type {
  RegleCollectionErrors,
  RegleCommonStatus,
  RegleErrorTree,
  RegleRuleStatus,
  RegleShortcutDefinition,
} from '@regle/core';
import type { PartialDeep } from 'type-fest';
import type { z } from 'zod';
import type { toZod } from './zod.types';
import type { GetNestedZodSchema } from './utils.types';

export interface ZodRegle<
  TState extends Record<string, any>,
  TSchema extends toZod<any>,
  TShortcuts extends RegleShortcutDefinition = {},
> {
  r$: ZodRegleStatus<TState, TSchema, TShortcuts>;
}

export type ZodRegleResult<TSchema extends z.ZodTypeAny> =
  | { result: false; data: PartialDeep<z.output<TSchema>> }
  | { result: true; data: z.output<TSchema> };

/**
 * @public
 */
export type ZodRegleStatus<
  TState extends Record<string, any> = Record<string, any>,
  TSchema extends toZod<any> = toZod<TState>,
  TShortcuts extends RegleShortcutDefinition = {},
> = RegleCommonStatus<TState> & {
  readonly $fields: TSchema extends z.ZodObject<infer O extends z.ZodRawShape>
    ? keyof TState extends keyof O
      ? {
          readonly [TKey in keyof TState]: O[TKey] extends z.ZodTypeAny
            ? InferZodRegleStatusType<O[TKey], TState, TKey, TShortcuts>
            : never;
        } & {
          readonly [TKey in keyof TState as O[TKey] extends NonNullable<O[TKey]>
            ? TKey
            : never]-?: InferZodRegleStatusType<NonNullable<O[TKey]>, NonNullable<TState>, TKey, TShortcuts>;
        }
      : {}
    : {};
  readonly $errors: RegleErrorTree<TState>;
  readonly $silentErrors: RegleErrorTree<TState>;
  $resetAll: () => void;
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
  $validate: () => Promise<ZodRegleResult<TSchema>>;
} & ([TShortcuts['nested']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['nested']]: ReturnType<NonNullable<TShortcuts['nested']>[K]>;
      });

/**
 * @public
 */
export type InferZodRegleStatusType<
  TSchema extends z.ZodTypeAny,
  TState extends Record<PropertyKey, any> = any,
  TKey extends PropertyKey = string,
  TShortcuts extends RegleShortcutDefinition = {},
> =
  GetNestedZodSchema<TSchema> extends z.ZodArray<infer A>
    ? ZodRegleCollectionStatus<A, TState[TKey], TShortcuts>
    : GetNestedZodSchema<TSchema> extends z.ZodObject<any>
      ? TState[TKey] extends Array<any>
        ? RegleCommonStatus<TState[TKey]>
        : ZodRegleStatus<TState[TKey], GetNestedZodSchema<TSchema>, TShortcuts>
      : ZodRegleFieldStatus<GetNestedZodSchema<TSchema>, TState[TKey], TKey, TShortcuts>;

/**
 * @public
 */
export type ZodRegleFieldStatus<
  TSchema extends z.ZodTypeAny,
  TState extends Record<PropertyKey, any> = any,
  TKey extends PropertyKey = string,
  TShortcuts extends RegleShortcutDefinition = {},
> = RegleCommonStatus<TState> & {
  $value: TState[TKey];
  $silentValue: TState[TKey];
  readonly $externalErrors?: string[];
  readonly $errors: string[];
  readonly $silentErrors: string[];
  readonly $rules: {
    [Key in `${string & TSchema['_def']['typeName']}`]: RegleRuleStatus<TState[TKey], []>;
  };
  $validate: () => Promise<ZodRegleResult<TSchema>>;
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
} & ([TShortcuts['fields']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['fields']]: ReturnType<NonNullable<TShortcuts['fields']>[K]>;
      });

/**
 * @public
 */
export type ZodRegleCollectionStatus<
  TSchema extends z.ZodTypeAny,
  TState extends any[],
  TShortcuts extends RegleShortcutDefinition = {},
> = Omit<ZodRegleFieldStatus<TSchema, TState>, '$errors' | '$silentErrors'> & {
  readonly $each: Array<InferZodRegleStatusType<NonNullable<TSchema>, TState, number, TShortcuts>>;
  readonly $field: ZodRegleFieldStatus<TSchema, TState, number, TShortcuts>;
  readonly $errors: RegleCollectionErrors<TState>;
  readonly $silentErrors: RegleCollectionErrors<TState>;
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
  $validate: () => Promise<ZodRegleResult<TSchema>>;
} & ([TShortcuts['collections']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['collections']]: ReturnType<NonNullable<TShortcuts['collections']>[K]>;
      });
