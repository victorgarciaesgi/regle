import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { EmptyObject, IsEmptyObject, IsUnion, IsUnknown, Or } from 'type-fest';
import type { MaybeRef, Raw, UnwrapNestedRefs, UnwrapRef } from 'vue';
import type {
  $InternalRegleCollectionErrors,
  $InternalRegleCollectionIssues,
  $InternalRegleErrors,
  $InternalRegleIssues,
  $InternalRegleResult,
  ExtendedRulesDeclarations,
  CollectionRegleBehaviourOptions,
  DeepPartial,
  ExtendOnlyRealRecord,
  ExtractFromGetter,
  FieldRegleBehaviourOptions,
  HasNamedKeys,
  InferOutput,
  InlineRuleDeclaration,
  JoinDiscriminatedUnions,
  MaybeInput,
  MaybeOutput,
  MaybeVariantStatus,
  RegleBehaviourOptions,
  RegleCollectionErrors,
  RegleCollectionResult,
  RegleCollectionRuleDecl,
  RegleCollectionRuleDefinition,
  RegleErrorTree,
  RegleFieldResult,
  RegleFormPropertyType,
  RegleIssuesTree,
  ReglePartialRuleTree,
  RegleRuleDecl,
  RegleRuleDefinition,
  RegleRuleMetadataDefinition,
  RegleShortcutDefinition,
  RegleStaticImpl,
  RegleValidationGroupEntry,
  RegleValidationGroupOutput,
  ResetOptions,
  RegleResult,
} from '..';

/**
 * @public
 */
export type RegleRoot<
  TState extends object | Record<string, unknown> = {},
  TRules extends ReglePartialRuleTree<TState> = Record<string, any>,
  TValidationGroups extends Record<string, RegleValidationGroupEntry[]> = never,
  TShortcuts extends RegleShortcutDefinition = {},
> = MaybeVariantStatus<TState, TRules, TShortcuts> &
  ([TValidationGroups] extends [never]
    ? {}
    : {
        /**
         * Collection of validation groups used declared with the `validationGroups` modifier
         */
        $groups: {
          readonly [TKey in keyof TValidationGroups]: RegleValidationGroupOutput;
        };
      });

type ProcessNestedFields<
  TState extends Record<string, any> | undefined,
  TRules extends ReglePartialRuleTree<NonNullable<TState>>,
  TShortcuts extends RegleShortcutDefinition = {},
  TIsFields extends boolean = false,
> =
  Or<HasNamedKeys<TState>, TIsFields> extends true
    ? {
        readonly [TKey in keyof TState as TRules[TKey] extends NonNullable<TRules[TKey]>
          ? NonNullable<TRules[TKey]> extends MaybeRef<RegleRuleDecl>
            ? IsEmptyObject<TRules[TKey]> extends true
              ? TKey
              : never
            : never
          : TKey]: IsUnion<NonNullable<TRules[TKey]>> extends true
          ? ExtendOnlyRealRecord<TState[TKey]> extends true
            ? MaybeVariantStatus<NonNullable<TState>[TKey], NonNullable<TRules[TKey]>, TShortcuts>
            : InferRegleStatusType<NonNullable<TRules[TKey]>, NonNullable<TState>, TKey, TShortcuts>
          : InferRegleStatusType<NonNullable<TRules[TKey]>, NonNullable<TState>, TKey, TShortcuts>;
      } & {
        readonly [TKey in keyof TState as TRules[TKey] extends NonNullable<TRules[TKey]>
          ? NonNullable<TRules[TKey]> extends MaybeRef<RegleRuleDecl>
            ? IsEmptyObject<TRules[TKey]> extends true
              ? never
              : TKey
            : TKey
          : never]-?: IsUnion<NonNullable<TRules[TKey]>> extends true
          ? ExtendOnlyRealRecord<TState[TKey]> extends true
            ? MaybeVariantStatus<NonNullable<TState>[TKey], NonNullable<TRules[TKey]>, TShortcuts>
            : InferRegleStatusType<NonNullable<TRules[TKey]>, NonNullable<TState>, TKey, TShortcuts>
          : InferRegleStatusType<NonNullable<TRules[TKey]>, NonNullable<TState>, TKey, TShortcuts>;
      }
    : {};

/**
 * @public
 */
export type RegleStatus<
  TState extends object | Record<string, any> | undefined = Record<string, any>,
  TRules extends ReglePartialRuleTree<NonNullable<TState>> = Record<string, any>,
  TShortcuts extends RegleShortcutDefinition = {},
> = RegleCommonStatus<TState, TRules> & {
  /** Represents all the children of your object. You can access any nested child at any depth to get the relevant data you need for your form. */
  readonly $fields: ProcessNestedFields<TState, TRules, TShortcuts, true>;
  /**
   * Collection of all the issues, collected for all children properties and nested forms.
   *
   * Only contains issues from properties where $dirty equals true.
   */
  readonly $issues: RegleIssuesTree<TState>;
  /**
   * Collection of all the error messages, collected for all children properties and nested forms.
   *
   * Only contains errors from properties where $dirty equals true.
   * */
  readonly $errors: RegleErrorTree<TState>;
  /** Collection of all the error messages, collected for all children properties. */
  readonly $silentErrors: RegleErrorTree<TState>;
  /** Will return a copy of your state with only the fields that are dirty. By default it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  $extractDirtyFields: (filterNullishValues?: boolean) => DeepPartial<TState>;
  /** Sets all properties as dirty, triggering all rules. It returns a promise that will either resolve to false or a type safe copy of your form state. Values that had the required rule will be transformed into a non-nullable value (type only). */
  $validate: (
    forceValues?: JoinDiscriminatedUnions<TState> extends EmptyObject
      ? any
      : HasNamedKeys<JoinDiscriminatedUnions<TState>> extends true
        ? IsUnknown<JoinDiscriminatedUnions<TState>> extends true
          ? any
          : JoinDiscriminatedUnions<TState>
        : any
  ) => Promise<RegleResult<JoinDiscriminatedUnions<TState>, TRules>>;
} & ProcessNestedFields<TState, TRules, TShortcuts> &
  ([TShortcuts['nested']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['nested']]: ReturnType<NonNullable<TShortcuts['nested']>[K]>;
      }) &
  (TRules['$self'] extends RegleRuleDecl
    ? {
        /** Represents the status of the parent object. Status only concern the object itself and not its children */
        readonly $self: RegleFieldStatus<NonNullable<TRules['$self']>, NonNullable<TRules['$self']>, TShortcuts>;
      }
    : {});
/**
 * @internal
 * @reference {@link RegleStatus}
 */
export interface $InternalRegleStatus extends $InternalRegleCommonStatus {
  $fields: {
    [x: string]: $InternalRegleStatusType;
  };
  readonly $issues: Record<string, $InternalRegleIssues>;
  readonly $errors: Record<string, $InternalRegleErrors>;
  readonly $silentErrors: Record<string, $InternalRegleErrors>;
  readonly '~modifiers'?: RegleBehaviourOptions;
  $extractDirtyFields: (filterNullishValues?: boolean) => Record<string, any>;
  $validate: (forceValues?: any) => Promise<$InternalRegleResult>;
  $id?: string;
  readonly $self?: $InternalRegleFieldStatus;
}

/**
 * @public
 */
export type InferRegleStatusType<
  TRule extends RegleCollectionRuleDecl | RegleRuleDecl | ReglePartialRuleTree<any>,
  TState extends Record<PropertyKey, any> = any,
  TKey extends PropertyKey = string,
  TShortcuts extends RegleShortcutDefinition = {},
> =
  HasNamedKeys<TState> extends true
    ? [TState[TKey]] extends [undefined | null]
      ? RegleFieldStatus<TState[TKey], TRule, TShortcuts>
      : NonNullable<TState[TKey]> extends Array<infer U extends Record<string, any>>
        ? U extends Record<string, any>
          ? TRule extends RegleCollectionRuleDefinition<any, any>
            ? ExtractFromGetter<TRule['$each']> extends ReglePartialRuleTree<any>
              ? RegleCollectionStatus<TState[TKey], ExtractFromGetter<TRule['$each']>, TRule, TShortcuts>
              : RegleFieldStatus<TState[TKey], TRule, TShortcuts>
            : RegleCollectionStatus<TState[TKey], {}, TRule, TShortcuts>
          : RegleFieldStatus<TState[TKey], TRule, TShortcuts>
        : TRule extends ReglePartialRuleTree<any>
          ? NonNullable<TState[TKey]> extends Array<any>
            ? RegleFieldStatus<TState[TKey], TRule, TShortcuts>
            : NonNullable<TState[TKey]> extends Date | File
              ? RegleFieldStatus<Raw<TState[TKey]>, TRule, TShortcuts>
              : unknown extends TState[TKey]
                ? RegleFieldStatus<TState[TKey], TRule, TShortcuts>
                : NonNullable<TState[TKey]> extends Record<PropertyKey, any>
                  ? NonNullable<TState[TKey]> extends RegleStaticImpl<infer U>
                    ? RegleFieldStatus<Raw<U>, TRule, TShortcuts>
                    : TRule extends ReglePartialRuleTree<TState[TKey]>
                      ? MaybeVariantStatus<TState[TKey], TRule, TShortcuts>
                      : MaybeVariantStatus<TState[TKey], {}, TShortcuts>
                  : RegleFieldStatus<TState[TKey], TRule, TShortcuts>
          : NonNullable<TState[TKey]> extends Date | File
            ? RegleFieldStatus<Raw<NonNullable<TState[TKey]>>, TRule, TShortcuts>
            : unknown extends TState[TKey]
              ? RegleFieldStatus<TState[TKey], TRule, TShortcuts>
              : NonNullable<TState[TKey]> extends Record<PropertyKey, any>
                ? NonNullable<TState[TKey]> extends RegleStaticImpl<infer U>
                  ? RegleFieldStatus<Raw<U>, TRule, TShortcuts>
                  : MaybeVariantStatus<TState[TKey], ReglePartialRuleTree<TState[TKey]>, TShortcuts>
                : RegleFieldStatus<TState[TKey], TRule, TShortcuts>
    : RegleCommonStatus<unknown>;

/**
 * @internal
 * @reference {@link InferRegleStatusType}
 */
export type $InternalRegleStatusType =
  | $InternalRegleCollectionStatus
  | $InternalRegleStatus
  | $InternalRegleFieldStatus;

export type RegleFieldIssue<
  TRules extends RegleFormPropertyType<unknown, Partial<ExtendedRulesDeclarations>> = EmptyObject,
> = {
  readonly $property: string;
  readonly $type?: string;
  readonly $message: string;
} & (IsEmptyObject<TRules> extends true
  ? {
      readonly $rule: string;
    }
  : {
      [K in keyof ComputeFieldRules<any, TRules>]: ComputeFieldRules<any, TRules>[K] extends {
        $metadata: infer TMetadata;
      }
        ? K extends string
          ? { readonly $rule: K } & (TMetadata extends boolean ? { readonly $rule: string } : TMetadata)
          : { readonly $rule: string }
        : { readonly $rule: string };
    }[keyof ComputeFieldRules<any, TRules>]);

type ComputeFieldRules<
  TState extends any,
  TRules extends MaybeRef<RegleFormPropertyType<unknown, Partial<ExtendedRulesDeclarations>>>,
> =
  IsEmptyObject<UnwrapRef<TRules>> extends true
    ? {
        readonly [x: string]: RegleRuleStatus<TState, any[], any>;
      }
    : {
        readonly [TRuleKey in keyof Omit<
          UnwrapRef<TRules>,
          '$each' | keyof FieldRegleBehaviourOptions
        >]: RegleRuleStatus<
          TState,
          UnwrapRef<TRules>[TRuleKey] extends RegleRuleDefinition<any, infer TParams, any> ? TParams : [],
          UnwrapRef<TRules>[TRuleKey] extends RegleRuleDefinition<any, any, any, infer TMetadata>
            ? TMetadata
            : UnwrapRef<TRules>[TRuleKey] extends InlineRuleDeclaration<any, any[], infer TMetadata>
              ? TMetadata extends Promise<infer P>
                ? P
                : TMetadata
              : boolean
        >;
      };

/**
 * @public
 */
export type RegleFieldStatus<
  TState extends any = any,
  TRules extends RegleFormPropertyType<any, Partial<ExtendedRulesDeclarations>> = Record<string, any>,
  TShortcuts extends RegleShortcutDefinition = never,
> = Omit<RegleCommonStatus<TState, TRules>, '$value' | '$silentValue' | '$initialValue' | '$originalValue'> & {
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
   * Collect all metadata of validators, Only contains metadata from properties where $dirty equals true.
   */
  readonly $issues: RegleFieldIssue<TRules>[];
  /**
   * Collect all metadata of validators, including the error message.
   */
  readonly $silentIssues: RegleFieldIssue<TRules>[];
  /** Stores external errors of the current field */
  readonly $externalErrors: string[];
  /** Stores active tooltips messages of the current field */
  readonly $tooltips: string[];
  /** Represents the inactive status. Is true when this state have empty rules */
  readonly $inactive: boolean;
  /** Will return a copy of your state with only the fields that are dirty. By default it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  $extractDirtyFields: (filterNullishValues?: boolean) => MaybeOutput<TState>;
  /** Sets all properties as dirty, triggering all rules. It returns a promise that will either resolve to false or a type safe copy of your form state. Values that had the required rule will be transformed into a non-nullable value (type only). */
  $validate: (forceValues?: IsUnknown<TState> extends true ? any : TState) => Promise<RegleFieldResult<TState, TRules>>;
  /** This is reactive tree containing all the declared rules of your field. To know more about the rule properties check the rules properties section */
  readonly $rules: ComputeFieldRules<TState, TRules>;
} & ([TShortcuts['fields']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['fields']]: ReturnType<NonNullable<TShortcuts['fields']>[K]>;
      });

/**
 * @internal
 * @reference {@link RegleFieldStatus}
 */
export interface $InternalRegleFieldStatus extends $InternalRegleCommonStatus {
  $value: any;
  $silentValue: any;
  readonly $rules: Record<string, $InternalRegleRuleStatus>;
  readonly $externalErrors?: string[];
  readonly $errors: string[];
  readonly $tooltips: string[];
  readonly $inactive: boolean;
  readonly $silentErrors: string[];
  readonly $issues: RegleFieldIssue[];
  readonly $isDebouncing: boolean;
  readonly $schemaMode?: boolean;
  readonly '~modifiers'?: FieldRegleBehaviourOptions;
  $extractDirtyFields: (filterNullishValues?: boolean) => any;
  $validate: (forceValues?: any) => Promise<$InternalRegleResult>;
}

/**
 * @public
 */
export interface RegleCommonStatus<TValue = any, TRules extends Record<string, any> = never> extends StandardSchemaV1<
  TValue,
  [TRules] extends [never] ? TValue : InferOutput<TRules, TValue>
> {
  /** Indicates whether the field is invalid. It becomes true if any associated rules return false. */
  readonly $invalid: boolean;
  /**
   * This is not the opposite of `$invalid`. Correct is meant to display UI validation report.
   *
   * This will be `true` only if:
   * - The field has at least one active rule
   * - Is dirty and not empty
   * - Passes validation
   */
  readonly $correct: boolean;
  /** Indicates whether a field has been validated or interacted with by the user at least once. It's typically used to determine if a message should be displayed to the user. You can change this flag manually using the $touch and $reset methods. The $dirty flag is considered true if the current model has been touched or if all its children are dirty.*/
  readonly $dirty: boolean;
  /** Similar to $dirty, with one exception. The $anyDirty flag is considered true if given model was touched or any of its children are $anyDirty which means at least one descendant is $dirty. */
  readonly $anyDirty: boolean;
  /** Indicates whether a field has been touched and if the value is different than the initial one.
   *  On nested elements and collections, it's true only if all its children are also `$edited`.
   *  Use `$anyEdited` to check for any edited children
   */
  readonly $edited: boolean;
  /** Similar to $edited, with one exception. The $anyEdited flag is considered true if given model was edited or any of its children are $anyEdited which means at least one descendant is $edited. */
  readonly $anyEdited: boolean;
  /** Indicates if any async rule for the field is currently running. Always false for synchronous rules. */
  readonly $pending: boolean;
  /** Convenience flag to easily decide if a message should be displayed. Equivalent to $dirty && !$pending && $invalid. */
  readonly $error: boolean;
  /** Indicates whether the field is ready for submission. Equivalent to !$invalid && !$pending. */
  readonly $ready: boolean;
  /** Return the current key name of the field. */
  readonly $name: string;
  /** Returns the current path of the rule (used internally for tracking) */
  readonly $path: string;
  /** Id used to track collections items */
  $id?: string;
  /** A reference to the original validated model. It can be used to bind your form with v-model.*/
  $value: JoinDiscriminatedUnions<UnwrapNestedRefs<TValue>>;
  /**
   * `$value` variant that will not "touch" the field and update the value silently, running only the rules, so you can easily swap values without impacting user interaction.
   * */
  $silentValue: JoinDiscriminatedUnions<UnwrapNestedRefs<TValue>>;
  /**
   * This value reflect the current initial value of the field.
   * The initial value is different than the original value as the initial value can be mutated when using `$reset`.
   */
  readonly $initialValue: JoinDiscriminatedUnions<UnwrapNestedRefs<TValue>>;
  /**
   * This value reflect the original value of the field at original call. This can't be mutated
   */
  readonly $originalValue: JoinDiscriminatedUnions<UnwrapNestedRefs<TValue>>;

  /** Marks the field and all nested properties as $dirty. */
  $touch(): void;
  /**
   * Reset the validation status to a pristine state while keeping the current form state.
   * Resets the `$dirty` state on all nested properties of a form.
   * Rerun rules if `$lazy` is false
   */
  $reset(): void;
  $reset(options?: ResetOptions<TValue>): void;
  /** Clears the $externalErrors state back to an empty object. */
  $clearExternalErrors(): void;
}

export interface $InternalRegleCommonStatus extends Omit<RegleCommonStatus, '$touch' | '$reset'> {
  $touch(runCommit?: boolean, withConditions?: boolean): void;
  $unwatch(): void;
  $watch(): void;
  $reset(options?: ResetOptions<any>, fromParent?: boolean): void;
  $abort(): void;
}

/**
 * @public
 */
export type RegleRuleStatus<
  TValue = any,
  TParams extends any[] = any[],
  TMetadata extends RegleRuleMetadataDefinition = boolean,
> = {
  /** The name of the rule type. */
  readonly $type: string;
  /** Returns the computed error message or messages for the current rule. */
  readonly $message: string | string[];
  /** Stores the current rule tooltip or tooltips */
  readonly $tooltip: string | string[];
  /** Indicates whether or not the rule is enabled (for rules like requiredIf) */
  readonly $active: boolean;
  /** Indicates the state of validation for this validator. */
  readonly $valid: boolean;
  /** If the rule is async, indicates if it's currently pending. Always false if it's synchronous. */
  readonly $pending: boolean;
  /** Returns the current path of the rule (used internally for tracking) */
  readonly $path: string;
  /** Contains the metadata returned by the validator function. */
  readonly $metadata: TMetadata extends boolean ? TMetadata : Omit<TMetadata, '$valid'>;
  /** Run the rule validator and compute its properties like $message and $active */
  $parse(): Promise<boolean>;
  /** Reset the $valid, $metadata and $pending states */
  $reset(): void;
  /** Returns the original rule validator function. */
  $validator: ((
    value: IsUnknown<TValue> extends true ? any : MaybeInput<TValue>,
    ...args: any[]
  ) => RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>) &
    ((
      value: IsUnknown<TValue> extends true ? any : TValue,
      ...args: [TParams] extends [never[]] ? [] : [unknown[]] extends [TParams] ? any[] : TParams
    ) => RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>);
} & ([TParams] extends [never[]]
  ? {}
  : [unknown[]] extends [TParams]
    ? {
        /** Contains the rule parameters when the rule accepts arguments. */
        readonly $params?: any[];
      }
    : {
        /** Contains the rule parameters when the rule accepts arguments. */
        readonly $params: [...TParams];
      });

/**
 * @internal
 * @reference {@link RegleRuleStatus}
 */
export interface $InternalRegleRuleStatus {
  $type?: string;
  $message: string | string[];
  $tooltip: string | string[];
  $active: boolean;
  $valid: boolean;
  $pending: boolean;
  $path: string;
  $externalErrors?: string[];
  $params?: any[];
  $metadata: any;
  $haveAsync: boolean;
  $validating: boolean;
  $fieldDirty: boolean;
  $fieldInvalid: boolean;
  $fieldPending: boolean;
  $fieldCorrect: boolean;
  $fieldError: boolean;
  $maybePending: boolean;
  $validator(value: any, ...args: any[]): RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>;
  $parse(): Promise<boolean>;
  $reset(): void;
  $unwatch(): void;
  $watch(): void;
}

/**
 * @public
 */
export type RegleCollectionStatus<
  TState extends any[] = any[],
  TRules extends ReglePartialRuleTree<any> = Record<string, any>,
  TFieldRule extends RegleCollectionRuleDecl<any, any> = never,
  TShortcuts extends RegleShortcutDefinition = {},
> = Omit<RegleCommonStatus<TState, TRules>, '$value'> & {
  /** A reference to the original validated model. It can be used to bind your form with v-model.*/
  $value: MaybeOutput<TState>;
  /** $value variant that will not "touch" the field and update the value silently, running only the rules, so you can easily swap values without impacting user interaction. */
  $silentValue: MaybeOutput<TState>;
  /** Collection of status of every item in your collection. Each item will be a field you can access, or map on it to display your elements. */
  readonly $each: Array<InferRegleStatusType<NonNullable<TRules>, NonNullable<TState>, number, TShortcuts>>;
  /** Represents the status of the collection itself. You can have validation rules on the array like minLength, this field represents the isolated status of the collection. */
  readonly $self: RegleFieldStatus<TState, TFieldRule, TShortcuts>;
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
  /** Will return a copy of your state with only the fields that are dirty. By default it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  $extractDirtyFields: (filterNullishValues?: boolean) => DeepPartial<TState>;
  /** Sets all properties as dirty, triggering all rules. It returns a promise that will either resolve to false or a type safe copy of your form state. Values that had the required rule will be transformed into a non-nullable value (type only). */
  $validate: (
    value?: JoinDiscriminatedUnions<TState>
  ) => Promise<RegleCollectionResult<TState, JoinDiscriminatedUnions<TRules>>>;
} & ([TShortcuts['collections']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['collections']]: ReturnType<NonNullable<TShortcuts['collections']>[K]>;
      });

/**
 * @internal
 * @reference {@link RegleCollectionStatus}
 */
export interface $InternalRegleCollectionStatus extends Omit<
  $InternalRegleStatus,
  '$fields' | '$issues' | '$errors' | '$silentErrors' | '~modifiers'
> {
  readonly $self: $InternalRegleFieldStatus;
  readonly $each: Array<$InternalRegleStatusType>;
  readonly $issues: $InternalRegleCollectionIssues;
  readonly $errors: $InternalRegleCollectionErrors;
  readonly $silentErrors: $InternalRegleCollectionErrors;
  readonly $externalErrors?: string[];
  readonly '~modifiers'?: CollectionRegleBehaviourOptions;
  $extractDirtyFields: (filterNullishValues?: boolean) => any[];
  $validate: (forceValues?: any) => Promise<$InternalRegleResult>;
}
