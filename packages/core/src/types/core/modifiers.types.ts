import type { RequiredDeep } from 'type-fest';
import type { Ref } from 'vue';
import type { DefaultValidators } from '../../core';
import type {
  $InternalRegleCollectionStatus,
  $InternalRegleStatus,
  CustomRulesDeclarationTree,
  RegleCollectionStatus,
  RegleExternalErrorTree,
  RegleFieldStatus,
  ReglePartialRuleTree,
  RegleStatus,
} from '../rules';
import type { DeepMaybeRef, OmitByType, Unwrap } from '../utils';

export interface RegleBehaviourOptions {
  /**
   * Only display error when calling `r$.$validate()`
   * @default false
   */
  lazy?: boolean | undefined;
  /**
   * Automatically set the dirty set without the need of `$value` or `$touch`.
   * @default true
   *
   */
  autoDirty?: boolean | undefined;
  /**
   * Only update error status when calling `$validate`.
   * Will not display errors as you type
   * @default false
   *
   * @default true if rewardEarly is true
   *
   */
  silent?: boolean | undefined;
  /**
   * The fields will turn valid when they are, but not invalid unless calling `r$.$validate()`
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
}

export interface LocalRegleBehaviourOptions<
  TState extends Record<string, any>,
  TRules extends ReglePartialRuleTree<TState, CustomRulesDeclarationTree>,
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

export type RegleValidationGroupEntry = RegleFieldStatus<any, any> | undefined;

export interface RegleValidationGroupOutput {
  $invalid: boolean;
  $error: boolean;
  $pending: boolean;
  $dirty: boolean;
  $correct: boolean;
  $errors: string[];
  $silentErrors: string[];
}

export type FieldRegleBehaviourOptions = AddDollarToOptions<RegleBehaviourOptions> & {
  /**
   * Let you declare the number of milliseconds the rule needs to wait before executing. Useful for async or heavy computations.
   */
  $debounce?: number;
};

export type CollectionRegleBehaviourOptions = FieldRegleBehaviourOptions & {
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
  nested?: ShortcutCommonFn<
    RegleStatus<Record<string, any>, ReglePartialRuleTree<any, Partial<TCustomRules> & Partial<DefaultValidators>>>
  >;
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
