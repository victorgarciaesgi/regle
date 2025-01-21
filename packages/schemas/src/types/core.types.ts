import type {
  JoinDiscriminatedUnions,
  RegleCollectionErrors,
  RegleCommonStatus,
  RegleErrorTree,
  RegleRuleStatus,
  RegleShortcutDefinition,
} from '@regle/core';
import type { EmptyObject, Or, PartialDeep } from 'type-fest';
import type { ArrayElement } from 'type-fest/source/internal';
import type { Raw } from 'vue';
import type { RegleSchemaMode, isModeRules } from './options.types';

export interface RegleSchema<
  TState extends Record<string, any>,
  TSchema extends Record<string, any>,
  TMode extends RegleSchemaMode = 'rules',
  TShortcuts extends RegleShortcutDefinition = {},
> {
  /**
   * r$ is a reactive object containing the values, errors, dirty state and all the necessary validations properties you'll need to display informations.
   *
   * To see the list of properties: {@link https://reglejs.dev/core-concepts/validation-properties}
   */
  r$: Raw<RegleSchemaStatus<TState, TSchema, TMode, TShortcuts, true>>;
}

export type RegleSchemaResult<TSchema extends unknown> =
  | { result: false; data: PartialDeep<TSchema> }
  | { result: true; data: TSchema };

/**
 * @public
 */
export type RegleSchemaStatus<
  TState extends Record<string, any> = Record<string, any>,
  TSchema extends Record<string, any> = Record<string, any>,
  TMode extends RegleSchemaMode = 'rules',
  TShortcuts extends RegleShortcutDefinition = {},
  IsRoot extends boolean = false,
> = Omit<RegleCommonStatus<TState>, Or<isModeRules<TMode>, IsRoot> extends false ? '$pending' : ''> & {
  /** Represents all the children of your object. You can access any nested child at any depth to get the relevant data you need for your form. */
  readonly $fields: {
    readonly [TKey in keyof JoinDiscriminatedUnions<TState>]: TKey extends keyof JoinDiscriminatedUnions<TSchema>
      ? InferRegleSchemaStatusType<
          NonNullable<JoinDiscriminatedUnions<TSchema>[TKey]>,
          JoinDiscriminatedUnions<TState>[TKey],
          TMode,
          TShortcuts
        >
      : never;
  } & {
    readonly [TKey in keyof JoinDiscriminatedUnions<TState> as TKey extends keyof JoinDiscriminatedUnions<TSchema>
      ? JoinDiscriminatedUnions<TSchema>[TKey] extends NonNullable<JoinDiscriminatedUnions<TSchema>[TKey]>
        ? TKey
        : never
      : never]-?: TKey extends keyof JoinDiscriminatedUnions<TSchema>
      ? InferRegleSchemaStatusType<
          NonNullable<JoinDiscriminatedUnions<TSchema>[TKey]>,
          JoinDiscriminatedUnions<TState>[TKey],
          TMode,
          TShortcuts
        >
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
} & (Or<isModeRules<TMode>, IsRoot> extends true
    ? {
        /** Sets all properties as dirty, triggering all rules. It returns a promise that will either resolve to false or a type safe copy of your form state. Values that had the required rule will be transformed into a non-nullable value (type only). */
        $validate: () => Promise<RegleSchemaResult<TSchema>>;
      }
    : {}) &
  ([TShortcuts['nested']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['nested']]: ReturnType<NonNullable<TShortcuts['nested']>[K]>;
      });

/**
 * @public
 */
export type InferRegleSchemaStatusType<
  TSchema extends unknown,
  TState extends unknown,
  TMode extends RegleSchemaMode = 'rules',
  TShortcuts extends RegleShortcutDefinition = {},
> =
  NonNullable<TSchema> extends Array<infer A extends Record<string, any>>
    ? RegleSchemaCollectionStatus<A, TState extends Array<any> ? TState : [], TMode, TShortcuts>
    : NonNullable<TState> extends Date | File
      ? RegleSchemaFieldStatus<TSchema, TState, TMode, TShortcuts>
      : unknown extends TState
        ? RegleSchemaFieldStatus<TSchema extends EmptyObject ? unknown : TSchema, TState, TMode, TShortcuts>
        : NonNullable<TSchema> extends Record<string, any>
          ? RegleSchemaStatus<
              NonNullable<TState> extends Record<string, any> ? NonNullable<TState> : {},
              NonNullable<TSchema>,
              TMode,
              TShortcuts
            >
          : RegleSchemaFieldStatus<TSchema, TState, TMode, TShortcuts>;

/**
 * @public
 */
export type RegleSchemaFieldStatus<
  TSchema extends unknown,
  TState = any,
  TMode extends RegleSchemaMode = 'rules',
  TShortcuts extends RegleShortcutDefinition = {},
> = Omit<RegleCommonStatus<TState>, isModeRules<TMode> extends false ? '$pending' : ''> & {
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
  readonly $rules: {
    [`~validator`]: RegleRuleStatus<TState, []>;
  };

  /** Will return a copy of your state with only the fields that are dirty. By default it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
} & (isModeRules<TMode> extends true
    ? {
        /** Sets the property as dirty, triggering all rules. It returns a promise that will either resolve to false or a type safe copy of your form state. Values that had the required rule will be transformed into a non-nullable value (type only). */
        $validate: () => Promise<RegleSchemaResult<TSchema>>;
      }
    : {}) &
  ([TShortcuts['fields']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['fields']]: ReturnType<NonNullable<TShortcuts['fields']>[K]>;
      });

/**
 * @public
 */
export type RegleSchemaCollectionStatus<
  TSchema extends Record<string, any>,
  TState extends any[],
  TMode extends RegleSchemaMode = 'rules',
  TShortcuts extends RegleShortcutDefinition = {},
> = Omit<RegleSchemaFieldStatus<TSchema, TState, TMode, TShortcuts>, '$errors' | '$silentErrors' | '$validate'> & {
  /** Collection of status of every item in your collection. Each item will be a field you can access, or map on it to display your elements. */
  readonly $each: Array<InferRegleSchemaStatusType<NonNullable<TSchema>, ArrayElement<TState>, TMode, TShortcuts>>;
  /** Represents the status of the collection itself. You can have validation rules on the array like minLength, this field represents the isolated status of the collection. */
  readonly $self: RegleSchemaFieldStatus<TSchema, TState, TMode, TShortcuts>;
  /** Collection of all the error messages, collected for all children properties and nested forms.
   *
   * Only contains errors from properties where $dirty equals true. */
  readonly $errors: RegleCollectionErrors<TSchema>;
  /** Collection of all the error messages, collected for all children properties and nested forms.  */
  readonly $silentErrors: RegleCollectionErrors<TSchema>;
  /** Will return a copy of your state with only the fields that are dirty. By default it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
} & (isModeRules<TMode> extends true
    ? {
        /** Sets the property as dirty, triggering all rules. It returns a promise that will either resolve to false or a type safe copy of your form state. Values that had the required rule will be transformed into a non-nullable value (type only). */
        $validate: () => Promise<RegleSchemaResult<TSchema>>;
      }
    : {}) &
  ([TShortcuts['collections']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['collections']]: ReturnType<NonNullable<TShortcuts['collections']>[K]>;
      });