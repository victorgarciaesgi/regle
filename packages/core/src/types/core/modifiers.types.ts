import type { RequiredDeep } from 'type-fest';
import type { Ref } from 'vue';
import type { DefaultValidators } from '../../core';
import type {
  $InternalRegleCollectionStatus,
  $InternalRegleStatus,
  RegleCollectionStatus,
  RegleExternalErrorTree,
  RegleFieldStatus,
  ReglePartialRuleTree,
  RegleStatus,
} from '../rules';
import type { DeepMaybeRef, OmitByType, Unwrap } from '../utils';
import type { isEditedHandlerFn } from './overrides.types';

export interface RegleBehaviourOptions {
  /**
   * Does not run rules until the field is dirty.
   * @default false
   */
  lazy?: boolean | undefined;
  /**
   * Automatically set the dirty state to true when value is changed without the need of calling `$touch`.
   * @default true
   *
   */
  autoDirty?: boolean | undefined;
  /**
   * Only update error status when calling `$validate` or `$validateSync`.
   * Will not display errors as you type
   * @default false
   *
   * @default true if rewardEarly is true
   *
   */
  silent?: boolean | undefined;
  /**
   * The fields will turn valid when they are, but not invalid unless calling `r$.$validate()` or `$validateSync`
   * @default false
   */
  rewardEarly?: boolean | undefined;
  /**
   * Define whether the external errors should be cleared when updating a field
   *
   * Default to `false` if `$silent` is set to `true`
   *
   * @default true
   */
  clearExternalErrorsOnChange?: boolean | undefined;
  /**
   * Define whether the external errors should be cleared when calling `$validate` or `$validateSync`
   *
   * @default true
   */
  clearExternalErrorsOnValidate?: boolean | undefined;
  /**
   * Set the dirty state to true when the form is initialized.
   * @default false
   */
  immediateDirty?: boolean | undefined;
  /**
   * Disable all the computation
   * @default false
   */
  disabled?: boolean | undefined;
}

export interface LocalRegleBehaviourOptions<
  TState extends Record<string, any>,
  TRules extends ReglePartialRuleTree<TState>,
  TValidationGroups extends Record<string, RegleValidationGroupEntry[]> = {},
> {
  /**
   * A dictionary of external errors to be injected into the field statuses.
   *
   * Useful for integrating errors from a backend or other validation sources.
   * External errors can be assigned using a reactive object or a Ref, and will be merged into the `$externalErrors` and `$errors` properties for each field.
   *
   * More details: https://reglejs.dev/advanced-usage/external-errors
   */
  externalErrors?: Ref<RegleExternalErrorTree<Unwrap<TState>> | Record<string, string[]>>;
  /**
   * Allows you to group fields for custom collective validation logic.
   *
   * The `validationGroups` option lets you define logical groupings of fields within your form that should be validated or checked together.
   * This can be used, for example, to easily determine if a subset of your form (e.g. an "address" group or a set of "contact information" fields) are all valid or share a collective error state.
   *
   * The function receives the `$fields` object and must return an object where each key is a group name and the value is an array of RegleStatus or RegleFieldStatus instances representing the grouped fields.
   * These groups can then be referenced using `$validationGroups.<groupName>` to access their combined validation state (e.g. `$invalid`, `$error`, `$errors`, etc).
   *
   * More details: https://reglejs.dev/core-concepts/modifiers#validationgroups
   */
  validationGroups?: (fields: RegleStatus<TState, TRules>['$fields']) => TValidationGroups;
  /**
   * A unique identifier for the Regle instance in the devtools.
   * @default undefined
   */
  id?: string | undefined;
}

export type FieldOnlyRegleBehaviourOptions = {
  /**
   * Set external errors for the field.
   */
  externalErrors?: Ref<string[]>;
  /**
   * A unique identifier for the Regle instance in the devtools.
   * @default undefined
   */
  id?: string | undefined;
};

export type RegleValidationGroupEntry = RegleFieldStatus<any, any> | undefined;

export interface RegleValidationGroupOutput {
  /** Indicates whether any field in the validation group is invalid. */
  $invalid: boolean;
  /** Convenience flag to easily decide if an error message should be displayed. True when any field in the group is dirty, not pending, and invalid. */
  $error: boolean;
  /** Indicates if any async rule in the validation group is currently running. */
  $pending: boolean;
  /** Indicates whether any field in the validation group has been interacted with by the user. */
  $dirty: boolean;
  /** Indicates whether all fields in the validation group pass validation and are dirty. */
  $correct: boolean;
  /** Collection of all error messages from fields in the group where $dirty equals true. */
  $errors: string[];
  /** Collection of all error messages from fields in the group, regardless of $dirty state. */
  $silentErrors: string[];
}

export type FieldRegleBehaviourOptions<TValue extends unknown = unknown> = AddDollarToOptions<RegleBehaviourOptions> & {
  /**
   * Let you declare the number of milliseconds the rule needs to wait before executing. Useful for async or heavy computations.
   */
  $debounce?: number;
  /**
   * Override the default `$edited` handler.
   */
  $isEdited?: isEditedHandlerFn<TValue>;
};

export type CollectionRegleBehaviourOptions<TValue extends unknown = unknown> = FieldRegleBehaviourOptions<TValue> & {
  /**
   * Allow deep compare of array children to compute the `$edited` property
   *
   * Disabled by default for performance
   *
   * @default false
   * */
  $deepCompare?: boolean;
};

export type ResolvedRegleBehaviourOptions = DeepMaybeRef<RequiredDeep<RegleBehaviourOptions>> &
  LocalRegleBehaviourOptions<Record<string, any>, Record<string, any>, Record<string, any[]>>;

export type ShortcutCommonFn<T extends Record<string, any>> = {
  [x: string]: (element: Omit<OmitByType<T, Function>, '~standard'>) => unknown;
};

export type RegleShortcutDefinition<TCustomRules extends Record<string, any> = {}> = {
  /**
   * Allow you to customize the properties for every field
   */
  fields?: ShortcutCommonFn<RegleFieldStatus<any, Partial<TCustomRules> & Partial<DefaultValidators>>>;
  /**
   * Allow you to customize the properties for every parent of a nested object
   */
  nested?: ShortcutCommonFn<RegleStatus<Record<string, any>, ReglePartialRuleTree<any, Partial<TCustomRules>>>>;
  /**
   * Allow you to customize the properties for every parent of a collection
   */
  collections?: ShortcutCommonFn<RegleCollectionStatus<any[], Partial<TCustomRules> & Partial<DefaultValidators>>>;
};

export type $InternalRegleShortcutDefinition = {
  /**
   * Allow you to customize the properties for every field
   */
  fields?: ShortcutCommonFn<Record<string, any>>;
  /**
   * Allow you to customize the properties for every parent of a nested object
   */
  nested?: ShortcutCommonFn<$InternalRegleStatus>;
  /**
   * Allow you to customize the properties for every parent of a collection
   */
  collections?: ShortcutCommonFn<$InternalRegleCollectionStatus>;
};

export type AddDollarToOptions<T extends Record<string, any>> = {
  [K in keyof T as `$${string & K}`]: T[K];
};

export type FilterDollarProperties<T extends Record<string, any>> = {
  [K in keyof T as K extends `$${string}` ? never : K]: T[K];
};

export type PickDollarProperties<T extends Record<string, any>> = {
  [K in keyof T as K extends `$${string}` ? K : never]: T[K];
};
