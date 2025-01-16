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
import type { Raw } from 'vue';

export interface ValibotRegle<
  TState extends Record<string, any>,
  TSchema extends MaybeObjectAsync<any>,
  TShortcuts extends RegleShortcutDefinition = {},
> {
  /**
   * r$ is a reactive object containing the values, errors, dirty state and all the necessary validations properties you'll need to display informations.
   *
   * To see the list of properties: {@link https://reglejs.dev/core-concepts/validation-properties}
   */
  r$: Raw<ValibotRegleStatus<TState, TSchema, TShortcuts>>;
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
  /** Represents all the children of your object. You can access any nested child at any depth to get the relevant data you need for your form. */
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
  /** Collection of all the error messages, collected for all children properties and nested forms.
   *
   * Only contains errors from properties where $dirty equals true. */
  readonly $errors: RegleErrorTree<TState>;
  /** Collection of all the error messages, collected for all children properties. */
  readonly $silentErrors: RegleErrorTree<TState>;
  /** Will return a copy of your state with only the fields that are dirty. By default it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
  /** Sets all properties as dirty, triggering all rules. It returns a promise that will either resolve to false or a type safe copy of your form state. Values that had the required rule will be transformed into a non-nullable value (type only). */
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
  /** Collection of all the error messages, collected for all children properties and nested forms.
   *
   * Only contains errors from properties where $dirty equals true. */
  readonly $errors: string[];
  /** Collection of all the error messages, collected for all children properties and nested forms.  */
  readonly $silentErrors: string[];
  /** Will return a copy of your state with only the fields that are dirty. By default it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  readonly $externalErrors?: string[];
  /** Represents the inactive status. Is true when this state have empty rules */
  readonly $inactive: boolean;
  /** This is reactive tree containing all the declared rules of your field. To know more about the rule properties check the rules properties section */
  readonly $rules: TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
    ? {
        [Key in `${string & TSchema['type']}`]: RegleRuleStatus<TState, []>;
      }
    : {};
  /** Sets all properties as dirty, triggering all rules. It returns a promise that will either resolve to false or a type safe copy of your form state. Values that had the required rule will be transformed into a non-nullable value (type only). */
  $validate: () => Promise<
    ValibotRegleResult<
      TSchema extends v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
        ? TSchema
        : v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
    >
  >;
  /** Will return a copy of your state with only the fields that are dirty. By default it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
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
  /** Collection of status of every item in your collection. Each item will be a field you can access, or map on it to display your elements. */
  readonly $each: Array<InferValibotRegleStatusType<NonNullable<TSchema>, ArrayElement<TState>, TShortcuts>>;
  /** Represents the status of the collection itself. You can have validation rules on the array like minLength, this field represents the isolated status of the collection. */
  readonly $field: ValibotRegleFieldStatus<TSchema, TState>;
  /** Collection of all the error messages, collected for all children properties and nested forms.
   *
   * Only contains errors from properties where $dirty equals true. */
  readonly $errors: RegleCollectionErrors<TSchema>;
  /** Collection of all the error messages, collected for all children properties and nested forms.  */
  readonly $silentErrors: RegleCollectionErrors<TSchema>;
  /** Will return a copy of your state with only the fields that are dirty. By default it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
  /** Sets all properties as dirty, triggering all rules. It returns a promise that will either resolve to false or a type safe copy of your form state. Values that had the required rule will be transformed into a non-nullable value (type only). */
  $validate: () => Promise<ValibotRegleResult<TSchema>>;
} & ([TShortcuts['collections']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['collections']]: ReturnType<NonNullable<TShortcuts['collections']>[K]>;
      });
