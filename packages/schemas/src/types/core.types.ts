import type {
  ArrayElement,
  HasNamedKeys,
  JoinDiscriminatedUnions,
  Maybe,
  MaybeOutput,
  PrimitiveTypes,
  RegleCollectionErrors,
  RegleCommonStatus,
  RegleErrorTree,
  RegleFieldIssue,
  RegleIssuesTree,
  RegleRuleStatus,
  RegleShortcutDefinition,
  RegleStaticImpl,
} from '@regle/core';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { EmptyObject, PartialDeep } from 'type-fest';
import type { Raw, UnwrapNestedRefs } from 'vue';
import type { MaybeSchemaVariantStatus } from './variants.types';

export type RegleSchema<
  TState extends Record<string, any>,
  TSchema extends StandardSchemaV1,
  TShortcuts extends RegleShortcutDefinition = {},
  TAdditionalReturnProperties extends Record<string, any> = {},
> = {
  /**
   * r$ is a reactive object containing the values, errors, dirty state and all the necessary validations properties you'll need to display information.
   *
   * To see the list of properties: {@link https://reglejs.dev/core-concepts/validation-properties}
   */
  r$: Raw<MaybeSchemaVariantStatus<TState, TSchema, TShortcuts, true>>;
} & TAdditionalReturnProperties;

export type RegleSingleFieldSchema<
  TState extends Maybe<PrimitiveTypes>,
  TSchema extends StandardSchemaV1,
  TShortcuts extends RegleShortcutDefinition = {},
  TAdditionalReturnProperties extends Record<string, any> = {},
> = {
  /**
   * r$ is a reactive object containing the values, errors, dirty state and all the necessary validations properties you'll need to display information.
   *
   * To see the list of properties: {@link https://reglejs.dev/core-concepts/validation-properties}
   */
  r$: Raw<
    RegleSchemaFieldStatus<TState, TShortcuts> & {
      /** Sets all properties as dirty, triggering all rules. It returns a promise that will either resolve to false or a type safe copy of your form state. Values that had the required rule will be transformed into a non-nullable value (type only). */
      $validate: (
        forceValues?: TState extends EmptyObject ? any : HasNamedKeys<TState> extends true ? TState : any
      ) => Promise<RegleSchemaResult<StandardSchemaV1.InferOutput<TSchema>>>;
    }
  >;
} & TAdditionalReturnProperties;

export type RegleSchemaResult<TSchema extends unknown> =
  | {
      valid: false;
      data: PartialDeep<TSchema>;
      issues: RegleIssuesTree<TSchema, true>;
      errors: RegleErrorTree<TSchema, false, true>;
    }
  | { valid: true; data: TSchema; issues: EmptyObject; errors: EmptyObject };

type ProcessNestedFields<TState extends Record<string, any> | undefined, TShortcuts extends RegleShortcutDefinition> =
  HasNamedKeys<TState> extends true
    ? {
        readonly [TKey in keyof JoinDiscriminatedUnions<TState>]: TKey extends keyof JoinDiscriminatedUnions<TState>
          ? InferRegleSchemaStatusType<NonNullable<JoinDiscriminatedUnions<TState>[TKey]>, TShortcuts>
          : never;
      } & {
        readonly [TKey in keyof JoinDiscriminatedUnions<TState> as TKey extends keyof JoinDiscriminatedUnions<TState>
          ? JoinDiscriminatedUnions<TState>[TKey] extends NonNullable<JoinDiscriminatedUnions<TState>[TKey]>
            ? TKey
            : never
          : never]-?: TKey extends keyof JoinDiscriminatedUnions<TState>
          ? InferRegleSchemaStatusType<NonNullable<JoinDiscriminatedUnions<TState>[TKey]>, TShortcuts>
          : never;
      }
    : {};

/**
 * @public
 */
export type RegleSchemaStatus<
  TState extends Record<string, any> | undefined = Record<string, any>,
  TSchema extends StandardSchemaV1 = StandardSchemaV1,
  TShortcuts extends RegleShortcutDefinition = {},
  IsRoot extends boolean = false,
> = Omit<RegleCommonStatus<TState>, IsRoot extends false ? '$pending' : ''> & {
  /** Represents all the children of your object. You can access any nested child at any depth to get the relevant data you need for your form. */
  readonly $fields: ProcessNestedFields<TState, TShortcuts>;
  /** Collection of all issues, collected for all children properties and nested forms.
   *
   * Only contains errors from properties where $dirty equals true. */
  readonly $issues: RegleIssuesTree<TState, true>;
  /** Collection of all the error messages, collected for all children properties and nested forms.
   *
   * Only contains errors from properties where $dirty equals true. */
  readonly $errors: RegleErrorTree<TState, false, true>;
  /** Collection of all the error messages, collected for all children properties. */
  readonly $silentErrors: RegleErrorTree<TState, false, true>;
  /** Will return a copy of your state with only the fields that are dirty. By default it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
} & ProcessNestedFields<TState, TShortcuts> &
  (IsRoot extends true
    ? {
        /** Sets all properties as dirty, triggering all rules. It returns a promise that will either resolve to false or a type safe copy of your form state. Values that had the required rule will be transformed into a non-nullable value (type only). */
        $validate: (
          forceValues?: TState extends EmptyObject ? (HasNamedKeys<TState> extends true ? TState : any) : TState
        ) => Promise<RegleSchemaResult<StandardSchemaV1.InferOutput<TSchema>>>;
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
export type InferRegleSchemaStatusType<TState extends unknown, TShortcuts extends RegleShortcutDefinition = {}> =
  NonNullable<TState> extends Array<any>
    ? RegleSchemaCollectionStatus<NonNullable<TState>, TShortcuts>
    : NonNullable<TState> extends Date | File
      ? RegleSchemaFieldStatus<TState, TShortcuts>
      : unknown extends TState
        ? RegleSchemaFieldStatus<TState extends EmptyObject ? unknown : TState, TShortcuts>
        : NonNullable<TState> extends Record<string, any>
          ? NonNullable<NonNullable<TState>> extends RegleStaticImpl<infer U>
            ? RegleSchemaFieldStatus<Raw<U>, TShortcuts>
            : MaybeSchemaVariantStatus<
                NonNullable<TState> extends Record<string, any> ? NonNullable<TState> : {},
                StandardSchemaV1,
                TShortcuts
              >
          : RegleSchemaFieldStatus<TState, TShortcuts>;

/**
 * @public
 */
export type RegleSchemaFieldStatus<TState = any, TShortcuts extends RegleShortcutDefinition = {}> = Omit<
  RegleCommonStatus<TState>,
  '$pending' | '$value' | '$silentValue' | '$initialValue' | '$originalValue'
> & {
  /** A reference to the original validated model. It can be used to bind your form with v-model.*/
  $value: MaybeOutput<UnwrapNestedRefs<TState>>;
  /** $value variant that will not "touch" the field and update the value silently, running only the rules, so you can easily swap values without impacting user interaction. */
  $silentValue: MaybeOutput<UnwrapNestedRefs<TState>>;
  /**
   * This value reflect the current initial value of the field.
   * The initial value is different than the original value as the initial value can be mutated when using `$reset`.
   */
  readonly $initialValue: MaybeOutput<UnwrapNestedRefs<TState>>;
  /**
   * This value reflect the original value of the field at original call. This can't be mutated
   */
  readonly $originalValue: MaybeOutput<UnwrapNestedRefs<TState>>;
  /** Collection of all the error messages, collected for all children properties and nested forms.
   *
   * Only contains errors from properties where $dirty equals true. */
  readonly $errors: string[];
  /** Collection of all the error messages, collected for all children properties and nested forms.  */
  readonly $silentErrors: string[];
  /**
   * Collect all metadata of validators, Only contains errors from properties where $dirty equals true.
   */
  readonly $issues: (RegleFieldIssue & StandardSchemaV1.Issue)[];
  /**
   * Collect all metadata of validators, including the error message.
   */
  readonly $silentIssues: (RegleFieldIssue & StandardSchemaV1.Issue)[];
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
} & ([TShortcuts['fields']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['fields']]: ReturnType<NonNullable<TShortcuts['fields']>[K]>;
      });

/**
 * @public
 */
export type RegleSchemaCollectionStatus<TState extends any[], TShortcuts extends RegleShortcutDefinition = {}> = Omit<
  RegleSchemaFieldStatus<TState, TShortcuts>,
  '$errors' | '$silentErrors' | '$validate'
> & {
  /** Collection of status for every item in your collection. Each item will be a field you can access or iterate to display your elements. */
  readonly $each: Array<InferRegleSchemaStatusType<ArrayElement<TState>, TShortcuts>>;
  /** Represents the status of the collection itself. You can have validation rules on the array like minLength, this field represents the isolated status of the collection. */
  readonly $self: RegleSchemaFieldStatus<TState, TShortcuts>;
  /**
   * Collection of all the issues, collected for all children properties and nested forms.
   *
   * Only contains issues from properties where $dirty equals true.
   */
  readonly $issues: RegleCollectionErrors<TState, true>;
  /** Collection of all the error messages, collected for all children properties and nested forms.
   *
   * Only contains errors from properties where $dirty equals true. */
  readonly $errors: RegleCollectionErrors<TState>;
  /** Collection of all the error messages, collected for all children properties and nested forms.  */
  readonly $silentErrors: RegleCollectionErrors<TState>;
  /** Will return a copy of your state with only the fields that are dirty. By default, it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
} & ([TShortcuts['collections']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['collections']]: ReturnType<NonNullable<TShortcuts['collections']>[K]>;
      });
