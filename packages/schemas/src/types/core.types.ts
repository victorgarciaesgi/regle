import type {
  ArrayElement,
  DeepPartial,
  HasNamedKeys,
  JoinDiscriminatedUnions,
  Maybe,
  MaybeOutput,
  PrimitiveTypes,
  RegleCollectionErrors,
  RegleCommonStatus,
  RegleErrorTree,
  RegleExternalCollectionErrors,
  RegleExternalSchemaErrorTree,
  RegleFieldIssue,
  RegleIssuesTree,
  RegleRuleStatus,
  RegleShortcutDefinition,
  RegleStaticImpl,
} from '@regle/core';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { EmptyObject, IsAny, IsUnion, IsUnknown, Or } from 'type-fest';
import type { Raw, UnwrapNestedRefs } from 'vue';
import type { MaybeSchemaVariantStatus } from './variants.types';

export type RegleSchema<
  TInput extends Record<string, any>,
  TOutput extends Record<string, any> = TInput,
  TSchema extends StandardSchemaV1 = StandardSchemaV1,
  TShortcuts extends RegleShortcutDefinition = {},
  TAdditionalReturnProperties extends Record<string, any> = {},
> = {
  /**
   * r$ is a reactive object containing the values, errors, dirty state and all the necessary validations properties you'll need to display information.
   *
   * To see the list of properties: {@link https://reglejs.dev/core-concepts/validation-properties}
   */
  r$: Raw<MaybeSchemaVariantStatus<TInput, TOutput, TSchema, TShortcuts, true>>;
} & TAdditionalReturnProperties;

export type RegleSingleFieldSchema<
  TInput extends Maybe<PrimitiveTypes>,
  TOutput = TInput,
  TSchema extends StandardSchemaV1 = StandardSchemaV1,
  TShortcuts extends RegleShortcutDefinition = {},
  TAdditionalReturnProperties extends Record<string, any> = {},
> = {
  /**
   * r$ is a reactive object containing the values, errors, dirty state and all the necessary validations properties you'll need to display information.
   *
   * To see the list of properties: {@link https://reglejs.dev/core-concepts/validation-properties}
   */
  r$: Raw<
    RegleSchemaFieldStatus<TInput, TOutput, TShortcuts> & {
      /** Sets all properties as dirty, triggering all rules. It returns a promise that will either resolve to false or a type safe copy of your form state. Values that had the required rule will be transformed into a non-nullable value (type only). */
      $validate: (
        forceValues?: TInput extends EmptyObject ? any : HasNamedKeys<TInput> extends true ? TInput : any
      ) => Promise<RegleSchemaResult<StandardSchemaV1.InferOutput<TSchema>>>;
    }
  >;
} & TAdditionalReturnProperties;

export type RegleSchemaResult<TSchema extends unknown> =
  | {
      valid: false;
      data: DeepPartial<TSchema>;
      issues: RegleIssuesTree<TSchema, true>;
      errors: RegleErrorTree<TSchema, false, true>;
    }
  | { valid: true; data: TSchema; issues: EmptyObject; errors: EmptyObject };

type ProcessNestedFields<
  TInput extends Record<string, any> | undefined,
  TOutput extends Record<string, any> | undefined = TInput,
  TShortcuts extends RegleShortcutDefinition = {},
> =
  HasNamedKeys<TInput> extends true
    ? {
        readonly [TKey in keyof JoinDiscriminatedUnions<TInput>]: TKey extends keyof JoinDiscriminatedUnions<TInput>
          ? InferRegleSchemaStatusType<
              NonNullable<JoinDiscriminatedUnions<TInput>[TKey]>,
              TKey extends keyof JoinDiscriminatedUnions<TOutput>
                ? NonNullable<JoinDiscriminatedUnions<TOutput>[TKey]>
                : undefined,
              TShortcuts
            >
          : never;
      } & {
        readonly [TKey in keyof JoinDiscriminatedUnions<TInput> as TKey extends keyof JoinDiscriminatedUnions<TInput>
          ? JoinDiscriminatedUnions<TInput>[TKey] extends NonNullable<JoinDiscriminatedUnions<TInput>[TKey]>
            ? TKey
            : never
          : never]-?: TKey extends keyof JoinDiscriminatedUnions<TInput>
          ? InferRegleSchemaStatusType<
              NonNullable<JoinDiscriminatedUnions<TInput>[TKey]>,
              TKey extends keyof JoinDiscriminatedUnions<TOutput>
                ? NonNullable<JoinDiscriminatedUnions<TOutput>[TKey]>
                : undefined,
              TShortcuts
            >
          : never;
      }
    : {
        [x: string]: RegleCommonStatus<unknown, unknown>;
      };

/**
 * @public
 */
export type RegleSchemaStatus<
  TInput extends Record<string, any> | undefined = Record<string, any>,
  TOutput extends Record<string, any> | undefined = TInput,
  TSchema extends StandardSchemaV1 = StandardSchemaV1,
  TShortcuts extends RegleShortcutDefinition = {},
  IsRoot extends boolean = false,
> = Omit<RegleCommonStatus<TInput, TOutput>, IsRoot extends false ? '$pending' : ''> & {
  /** Represents all the children of your object. You can access any nested child at any depth to get the relevant data you need for your form. */
  readonly $fields: ProcessNestedFields<JoinDiscriminatedUnions<TInput>, JoinDiscriminatedUnions<TOutput>, TShortcuts>;
  /** Collection of all issues, collected for all children properties and nested forms.
   *
   * Only contains errors from properties where $dirty equals true. */
  readonly $issues: RegleIssuesTree<TInput, true>;
  /** Collection of all the error messages, collected for all children properties and nested forms.
   *
   * Only contains errors from properties where $dirty equals true. */
  readonly $errors: RegleErrorTree<TInput, false, true>;
  readonly $output: TOutput;
  /** Collection of all the error messages, collected for all children properties. */
  readonly $silentErrors: RegleErrorTree<TInput, false, true>;
  /** Sets the external errors for the field. */
  $setExternalErrors(errors: RegleExternalSchemaErrorTree<TInput>): void;
  /** Will return a copy of your state with only the fields that are dirty. By default it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  $extractDirtyFields: (filterNullishValues?: boolean) => DeepPartial<TInput>;
} & (HasNamedKeys<TInput> extends true
    ? ProcessNestedFields<JoinDiscriminatedUnions<TInput>, JoinDiscriminatedUnions<TOutput>, TShortcuts>
    : {}) &
  (IsRoot extends true
    ? {
        /** Sets all properties as dirty, triggering all rules. It returns a promise that will either resolve to false or a type safe copy of your form state. Values that had the required rule will be transformed into a non-nullable value (type only). */
        $validate: (
          forceValues?: TInput extends EmptyObject ? (HasNamedKeys<TInput> extends true ? TInput : any) : TInput
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
export type InferRegleSchemaStatusType<
  TInput extends unknown,
  TOutput = TInput,
  TShortcuts extends RegleShortcutDefinition = {},
> =
  IsAny<TInput> extends true
    ? RegleSchemaFieldStatus<any, any, TShortcuts>
    : IsUnknown<TInput> extends true
      ? RegleCommonStatus<unknown, unknown>
      : NonNullable<TInput> extends Array<any>
        ? RegleSchemaCollectionStatus<NonNullable<TInput>, NonNullable<TOutput>, TShortcuts>
        : NonNullable<TInput> extends Date | File
          ? RegleSchemaFieldStatus<TInput, TOutput, TShortcuts>
          : unknown extends TInput
            ? RegleSchemaFieldStatus<
                TInput extends EmptyObject ? unknown : TInput,
                TOutput extends EmptyObject ? unknown : TOutput,
                TShortcuts
              >
            : NonNullable<TInput> extends Record<string, any>
              ? NonNullable<NonNullable<TInput>> extends RegleStaticImpl<infer U>
                ? RegleSchemaFieldStatus<Raw<U>, Raw<U>, TShortcuts>
                : MaybeSchemaVariantStatus<
                    NonNullable<TInput> extends Record<string, any> ? NonNullable<TInput> : {},
                    NonNullable<TOutput> extends Record<string, any> ? NonNullable<TOutput> : {},
                    StandardSchemaV1,
                    TShortcuts
                  >
              : RegleSchemaFieldStatus<TInput, TOutput, TShortcuts>;

/**
 * @public
 */
export type RegleSchemaFieldStatus<
  TInput = any,
  TOutput = TInput,
  TShortcuts extends RegleShortcutDefinition = {},
> = Omit<
  RegleCommonStatus<TInput, TOutput>,
  '$pending' | '$value' | '$silentValue' | '$initialValue' | '$originalValue'
> & {
  /** A reference to the original validated model. It can be used to bind your form with v-model.*/
  $value: MaybeOutput<UnwrapNestedRefs<TInput>>;
  /** $value variant that will not "touch" the field and update the value silently, running only the rules, so you can easily swap values without impacting user interaction. */
  $silentValue: MaybeOutput<UnwrapNestedRefs<TInput>>;
  /**
   * This value reflect the current initial value of the field.
   * The initial value is different than the original value as the initial value can be mutated when using `$reset`.
   */
  readonly $initialValue: MaybeOutput<UnwrapNestedRefs<TInput>>;
  /**
   * This value reflect the original value of the field at original call. This can't be mutated
   */
  readonly $originalValue: MaybeOutput<UnwrapNestedRefs<TInput>>;
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
  readonly $externalErrors: string[];
  /** Represents the inactive status. Is true when this state have empty rules */
  readonly $inactive: boolean;
  /** This is reactive tree containing all the declared rules of your field. To know more about the rule properties check the rules properties section */
  readonly $rules: {
    [`~validator`]: RegleRuleStatus<IsUnion<TInput> extends true ? any : TInput, []>;
  };
  readonly $output: TOutput;
  /** Sets the external errors for the field. */
  $setExternalErrors(errors: string[]): void;
  /** Will return a copy of your state with only the fields that are dirty. By default it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  $extractDirtyFields: (filterNullishValues?: boolean) => DeepPartial<TInput>;
} & ([TShortcuts['fields']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['fields']]: ReturnType<NonNullable<TShortcuts['fields']>[K]>;
      });

/**
 * @public
 */
export type RegleSchemaCollectionStatus<
  TInput extends any[],
  TOutput = TInput,
  TShortcuts extends RegleShortcutDefinition = {},
> = Omit<RegleSchemaFieldStatus<TInput, TOutput, TShortcuts>, '$errors' | '$silentErrors'> & {
  /** Collection of status for every item in your collection. Each item will be a field you can access or iterate to display your elements. */
  readonly $each: Array<InferRegleSchemaStatusType<ArrayElement<TInput>, ArrayElement<TOutput>, TShortcuts>>;
  /** Represents the status of the collection itself. You can have validation rules on the array like minLength, this field represents the isolated status of the collection. */
  readonly $self: RegleSchemaFieldStatus<TInput, TOutput, TShortcuts>;
  /**
   * Collection of all the issues, collected for all children properties and nested forms.
   *
   * Only contains issues from properties where $dirty equals true.
   */
  readonly $issues: RegleCollectionErrors<TInput, true>;
  /** Collection of all the error messages, collected for all children properties and nested forms.
   *
   * Only contains errors from properties where $dirty equals true. */
  readonly $errors: RegleCollectionErrors<TInput>;
  /** Collection of all the error messages, collected for all children properties and nested forms.  */
  readonly $silentErrors: RegleCollectionErrors<TInput>;
  readonly $output: TOutput;
  /** Will return a copy of your state with only the fields that are dirty. By default, it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  /** Sets the external errors for the field. */
  $setExternalErrors(errors: RegleExternalCollectionErrors<TInput>): void;
  /** Will return a copy of your state with only the fields that are dirty. By default, it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  $extractDirtyFields: (filterNullishValues?: boolean) => DeepPartial<TInput>;
} & ([TShortcuts['collections']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['collections']]: ReturnType<NonNullable<TShortcuts['collections']>[K]>;
      });
