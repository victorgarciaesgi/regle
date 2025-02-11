import type { PartialDeep } from 'type-fest';
import type { UnwrapNestedRefs } from 'vue';
import type {
  $InternalRegleCollectionErrors,
  $InternalRegleErrors,
  $InternalRegleResult,
  AllRulesDeclarations,
  ArrayElement,
  ExtractFromGetter,
  FieldRegleBehaviourOptions,
  InlineRuleDeclaration,
  JoinDiscriminatedUnions,
  Maybe,
  RegleCollectionErrors,
  RegleCollectionRuleDecl,
  RegleCollectionRuleDefinition,
  RegleErrorTree,
  RegleFormPropertyType,
  ReglePartialRuleTree,
  RegleResult,
  RegleRuleDecl,
  RegleRuleDefinition,
  RegleRuleMetadataDefinition,
  RegleShortcutDefinition,
  RegleValidationErrors,
  RegleValidationGroupEntry,
  RegleValidationGroupOutput,
} from '..';

/**
 * @public
 */
export type RegleRoot<
  TState extends Record<string, any> = Record<string, any>,
  TRules extends ReglePartialRuleTree<TState> = Record<string, any>,
  TValidationGroups extends Record<string, RegleValidationGroupEntry[]> = never,
  TShortcuts extends RegleShortcutDefinition = {},
> = RegleStatus<TState, TRules, TShortcuts> &
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

/** Supports both core Regle and schemas Regle for Zod/Valibot */
export type SuperCompatibleRegleRoot = SuperCompatibleRegleStatus & {
  $groups?: { [x: string]: RegleValidationGroupOutput };
  $validate: () => Promise<SuperCompatibleRegleResult>;
};

export type ScopedInstancesRecord = Record<string, Record<string, SuperCompatibleRegleRoot>> & {
  '~~global': Record<string, SuperCompatibleRegleRoot>;
};
export type ScopedInstancesRecordLike = Partial<ScopedInstancesRecord>;

export type SuperCompatibleRegleResult = $InternalRegleResult;

export interface SuperCompatibleRegleStatus extends SuperCompatibleRegleCommonStatus {
  $fields: {
    [x: string]: unknown;
  };
  readonly $errors: Record<string, RegleValidationErrors<any>>;
  readonly $silentErrors: Record<string, RegleValidationErrors<any>>;
  $extractDirtyFields: (filterNullishValues?: boolean) => Record<string, any>;
  $validate?: () => Promise<SuperCompatibleRegleResult>;
}
export type SuperCompatibleRegleRuleStatus = Omit<
  $InternalRegleRuleStatus,
  | '$haveAsync'
  | '$validating'
  | '$fieldDirty'
  | '$fieldInvalid'
  | '$fieldPending'
  | '$fieldCorrect'
  | '$fieldError'
  | '$unwatch'
  | '$watch'
>;

type SuperCompatibleRegleCommonStatus = Omit<RegleCommonStatus, '$pending'> & {
  $pending?: boolean;
};
export interface SuperCompatibleRegleFieldStatus extends SuperCompatibleRegleCommonStatus {
  $value: any;
  $silentValue: any;
  readonly $rules: Record<string, SuperCompatibleRegleRuleStatus>;
  readonly $externalErrors?: string[];
  readonly $errors: string[];
  readonly $inactive: boolean;
  readonly $silentErrors: string[];
  $extractDirtyFields: (filterNullishValues?: boolean) => any;
  $validate?: () => Promise<SuperCompatibleRegleResult>;
}
export interface SuperCompatibleRegleCollectionStatus
  extends Omit<SuperCompatibleRegleStatus, '$fields' | '$errors' | '$silentErrors'> {
  readonly $self: SuperCompatibleRegleFieldStatus;
  readonly $each: Array<SuperCompatibleRegleStatus | SuperCompatibleRegleFieldStatus>;
  readonly $errors: SuperCompatibleRegleCollectionErrors;
  readonly $silentErrors: SuperCompatibleRegleCollectionErrors;
  readonly $externalErrors?: string[];
  $extractDirtyFields: (filterNullishValues?: boolean) => any[];
  $validate?: () => Promise<SuperCompatibleRegleResult>;
}

export type SuperCompatibleRegleCollectionErrors = $InternalRegleCollectionErrors;

/**
 * @public
 */
export type RegleStatus<
  TState extends Record<string, any> | undefined = Record<string, any>,
  TRules extends ReglePartialRuleTree<NonNullable<TState>> = Record<string, any>,
  TShortcuts extends RegleShortcutDefinition = {},
> = RegleCommonStatus<TState> & {
  /** Represents all the children of your object. You can access any nested child at any depth to get the relevant data you need for your form. */
  readonly $fields: {
    readonly [TKey in keyof TState]: InferRegleStatusType<
      NonNullable<TRules[TKey]>,
      NonNullable<TState>,
      TKey,
      TShortcuts
    >;
  } & {
    readonly [TKey in keyof TState as TRules[TKey] extends NonNullable<TRules[TKey]>
      ? NonNullable<TRules[TKey]> extends RegleRuleDecl
        ? TKey
        : never
      : never]-?: InferRegleStatusType<NonNullable<TRules[TKey]>, NonNullable<TState>, TKey, TShortcuts>;
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
  $validate: () => Promise<RegleResult<TState, TRules>>;
} & ([TShortcuts['nested']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['nested']]: ReturnType<NonNullable<TShortcuts['nested']>[K]>;
      });
/**
 * @internal
 * @reference {@link RegleStatus}
 */
export interface $InternalRegleStatus extends RegleCommonStatus {
  $fields: {
    [x: string]: $InternalRegleStatusType;
  };
  readonly $errors: Record<string, $InternalRegleErrors>;
  readonly $silentErrors: Record<string, $InternalRegleErrors>;
  $extractDirtyFields: (filterNullishValues?: boolean) => Record<string, any>;
  $validate: () => Promise<$InternalRegleResult>;
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
  NonNullable<TState[TKey]> extends Array<Record<string, any> | any>
    ? TRule extends RegleCollectionRuleDefinition<any, any>
      ? ExtractFromGetter<TRule['$each']> extends ReglePartialRuleTree<any>
        ? RegleCollectionStatus<TState[TKey], ExtractFromGetter<TRule['$each']>, TRule, TShortcuts>
        : RegleFieldStatus<TState[TKey], TRule, TShortcuts>
      : RegleCollectionStatus<TState[TKey], {}, TRule, TShortcuts>
    : TRule extends ReglePartialRuleTree<any>
      ? NonNullable<TState[TKey]> extends Array<any>
        ? RegleCommonStatus<TState[TKey]>
        : NonNullable<TState[TKey]> extends Date | File
          ? RegleFieldStatus<TState[TKey], TRule, TShortcuts>
          : NonNullable<TState[TKey]> extends Record<PropertyKey, any>
            ? RegleStatus<TState[TKey], TRule, TShortcuts>
            : RegleFieldStatus<TState[TKey], TRule, TShortcuts>
      : NonNullable<TState[TKey]> extends Date | File
        ? RegleFieldStatus<TState[TKey], TRule, TShortcuts>
        : NonNullable<TState[TKey]> extends Record<PropertyKey, any>
          ? RegleStatus<TState[TKey], ReglePartialRuleTree<TState[TKey]>, TShortcuts>
          : RegleFieldStatus<TState[TKey], TRule, TShortcuts>;

/**
 * @internal
 * @reference {@link InferRegleStatusType}
 */
export type $InternalRegleStatusType =
  | $InternalRegleCollectionStatus
  | $InternalRegleStatus
  | $InternalRegleFieldStatus;

/**
 * @public
 */
export type RegleFieldStatus<
  TState extends any = any,
  TRules extends RegleFormPropertyType<any, Partial<AllRulesDeclarations>> = Record<string, any>,
  TShortcuts extends RegleShortcutDefinition = never,
> = Omit<RegleCommonStatus<TState>, '$value'> & {
  /** A reference to the original validated model. It can be used to bind your form with v-model.*/
  $value: Maybe<UnwrapNestedRefs<TState>>;
  /** $value variant that will not "touch" the field and update the value silently, running only the rules, so you can easily swap values without impacting user interaction. */
  $silentValue: Maybe<UnwrapNestedRefs<TState>>;
  /** Collection of all the error messages, collected for all children properties and nested forms.
   *
   * Only contains errors from properties where $dirty equals true. */
  readonly $errors: string[];
  /** Collection of all the error messages, collected for all children properties and nested forms.  */
  readonly $silentErrors: string[];
  /** Stores external errors of the current field */
  readonly $externalErrors: string[];
  /** Stores active tooltips messages of the current field */
  readonly $tooltips: string[];
  /** Represents the inactive status. Is true when this state have empty rules */
  readonly $inactive: boolean;
  /** Will return a copy of your state with only the fields that are dirty. By default it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  $extractDirtyFields: (filterNullishValues?: boolean) => Maybe<TState>;
  /** Sets all properties as dirty, triggering all rules. It returns a promise that will either resolve to false or a type safe copy of your form state. Values that had the required rule will be transformed into a non-nullable value (type only). */
  $validate: () => Promise<RegleResult<TState, TRules>>;
  /** This is reactive tree containing all the declared rules of your field. To know more about the rule properties check the rules properties section */
  readonly $rules: {
    readonly [TRuleKey in keyof Omit<TRules, '$each' | keyof FieldRegleBehaviourOptions>]: RegleRuleStatus<
      TState,
      TRules[TRuleKey] extends RegleRuleDefinition<any, infer TParams, any> ? TParams : [],
      TRules[TRuleKey] extends RegleRuleDefinition<any, any, any, infer TMetadata>
        ? TMetadata
        : TRules[TRuleKey] extends InlineRuleDeclaration<any, any[], infer TMetadata>
          ? TMetadata extends Promise<infer P>
            ? P
            : TMetadata
          : any
    >;
  };
} & ([TShortcuts['fields']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['fields']]: ReturnType<NonNullable<TShortcuts['fields']>[K]>;
      });

/**
 * @internal
 * @reference {@link RegleFieldStatus}
 */
export interface $InternalRegleFieldStatus extends RegleCommonStatus {
  $value: any;
  $silentValue: any;
  readonly $rules: Record<string, $InternalRegleRuleStatus>;
  readonly $externalErrors?: string[];
  readonly $errors: string[];
  readonly $inactive: boolean;
  readonly $silentErrors: string[];
  $extractDirtyFields: (filterNullishValues?: boolean) => any;
  $validate: () => Promise<$InternalRegleResult>;
}

/**
 * @public
 */
export interface RegleCommonStatus<TValue = any> {
  /* Indicates whether the field is invalid. It becomes true if any associated rules return false. */
  readonly $invalid: boolean;
  /**
   * This is not the opposite of `$invalid`. Correct is meant to display UI validation report.
   *
   * This will be `true` only if:
   * - The field have at least one active rule
   * - Is dirty and not empty
   * - Passes validation
   */
  readonly $correct: boolean;
  /* Indicates whether a field has been validated or interacted with by the user at least once. It's typically used to determine if a message should be displayed to the user. You can change this flag manually using the $touch and $reset methods. The $dirty flag is considered true if the current model has been touched or if all its children are dirty.*/
  readonly $dirty: boolean;
  /* Similar to $dirty, with one exception. The $anyDirty flag is considered true if given model was touched or any of its children are $anyDirty which means at least one descendant is $dirty. */
  readonly $anyDirty: boolean;
  /* Indicates whether a field has been touched and if the value is different than the initial one. */
  readonly $edited: boolean;
  /* Similar to $edited, with one exception. The $anyEdited flag is considered true if given model was edited or any of its children are $anyEdited which means at least one descendant is $edited. */
  readonly $anyEdited: boolean;
  /** Indicates if any async rule for the field is currently running. Always false for synchronous rules. */
  readonly $pending: boolean;
  /** Convenience flag to easily decide if a message should be displayed. Equivalent to $dirty && !$pending && $invalid. */
  readonly $error: boolean;
  /** Indicates whether the field is ready for submission. Equivalent to !$invalid && !$pending. */
  readonly $ready: boolean;
  /** Return the current key name of the field. */
  readonly $name: string;
  /** Id used to track collections items */
  $id?: string;
  /** A reference to the original validated model. It can be used to bind your form with v-model.*/
  $value: JoinDiscriminatedUnions<UnwrapNestedRefs<TValue>>;
  /** $value variant that will not "touch" the field and update the value silently, running only the rules, so you can easily swap values without impacting user interaction. */
  $silentValue: JoinDiscriminatedUnions<UnwrapNestedRefs<TValue>>;
  /** Marks the field and all nested properties as $dirty. */
  $touch(runCommit?: boolean, withConditions?: boolean): void;
  /**
   * - Restore the validation state to a pristine state while keeping the current state.
   * - Resets the `$dirty` state on all nested properties of a form.
   * - Rerun rules if `$lazy` is false
   */
  $reset(): void;
  /** Will reset both your validation state and your form state to their initial values. */
  $resetAll: () => void;
  /** Clears the $externalResults state back to an empty object. */
  $clearExternalErrors(): void;
  /** @interal */
  $unwatch(): void;
  /** @interal */
  $watch(): void;
}

/**
 * @public
 */
export type RegleRuleStatus<
  TValue = any,
  TParams extends any[] = any[],
  TMetadata extends RegleRuleMetadataDefinition = any,
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
  readonly $metadata: TMetadata;
  /** Run the rule validator and compute its properties like $message and $active */
  $validate(): Promise<boolean>;
  /** Reset the $valid, $metadata and $pending states */
  $reset(): void;
  /** Returns the original rule validator function. */
  $validator: ((
    value: Maybe<TValue>,
    ...args: [TParams] extends [never[]] ? [] : [unknown[]] extends [TParams] ? any[] : TParams
  ) => RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>) &
    ((
      value: TValue,
      ...args: [TParams] extends [never[]] ? [] : [unknown[]] extends [TParams] ? any[] : TParams
    ) => RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>);
} & ([TParams] extends [never[]]
  ? {}
  : [unknown[]] extends [TParams]
    ? {
        readonly $params?: any[];
      }
    : {
        readonly $params: TParams;
      });

/**
 * @internal
 * @reference {@link RegleRuleStatus}
 */
export interface $InternalRegleRuleStatus {
  $type: string;
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
  $validator(value: any, ...args: any[]): RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>;
  $validate(): Promise<boolean>;
  $unwatch(): void;
  $watch(): void;
  $reset(): void;
}

/**
 * @public
 */
export type RegleCollectionStatus<
  TState extends any[] = any[],
  TRules extends ReglePartialRuleTree<ArrayElement<TState>> = Record<string, any>,
  TFieldRule extends RegleCollectionRuleDecl<any, any> = never,
  TShortcuts extends RegleShortcutDefinition = {},
> = Omit<RegleCommonStatus<TState>, '$value'> & {
  /** A reference to the original validated model. It can be used to bind your form with v-model.*/
  $value: Maybe<TState>;
  /** $value variant that will not "touch" the field and update the value silently, running only the rules, so you can easily swap values without impacting user interaction. */
  $silentValue: Maybe<TState>;
  /** Collection of status of every item in your collection. Each item will be a field you can access, or map on it to display your elements. */
  readonly $each: Array<InferRegleStatusType<NonNullable<TRules>, NonNullable<TState>, number, TShortcuts>>;
  /** Represents the status of the collection itself. You can have validation rules on the array like minLength, this field represents the isolated status of the collection. */
  readonly $self: RegleFieldStatus<TState, TFieldRule, TShortcuts>;
  /** Collection of all the error messages, collected for all children properties and nested forms.
   *
   * Only contains errors from properties where $dirty equals true. */
  readonly $errors: RegleCollectionErrors<TState>;
  /** Collection of all the error messages, collected for all children properties and nested forms.  */
  readonly $silentErrors: RegleCollectionErrors<TState>;
  /** Will return a copy of your state with only the fields that are dirty. By default it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
  /** Sets all properties as dirty, triggering all rules. It returns a promise that will either resolve to false or a type safe copy of your form state. Values that had the required rule will be transformed into a non-nullable value (type only). */
  $validate: () => Promise<RegleResult<TState, TRules>>;
} & ([TShortcuts['collections']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['collections']]: ReturnType<NonNullable<TShortcuts['collections']>[K]>;
      });

/**
 * @internal
 * @reference {@link RegleCollectionStatus}
 */
export interface $InternalRegleCollectionStatus
  extends Omit<$InternalRegleStatus, '$fields' | '$errors' | '$silentErrors'> {
  readonly $self: $InternalRegleFieldStatus;
  readonly $each: Array<$InternalRegleStatusType>;
  readonly $errors: $InternalRegleCollectionErrors;
  readonly $silentErrors: $InternalRegleCollectionErrors;
  readonly $externalErrors?: string[];
  $extractDirtyFields: (filterNullishValues?: boolean) => any[];
  $validate: () => Promise<$InternalRegleResult>;
  /** Track each array state */
  $unwatch(): void;
  $watch(): void;
}
