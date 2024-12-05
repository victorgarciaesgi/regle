import type { RequiredDeep } from 'type-fest';
import type { Ref } from 'vue';
import type { DefaultValidators } from '../../core';
import type {
  CustomRulesDeclarationTree,
  RegleCollectionStatus,
  RegleExternalErrorTree,
  RegleFieldStatus,
  ReglePartialRuleTree,
  RegleStatus,
} from '../../types/rules';
import type { DeepMaybeRef, OmitByType, Unwrap } from '../../types/utils';

export interface RegleBehaviourOptions {
  /**
   * Only display error when calling `r$.$validate()`
   * @default false
   */
  lazy?: boolean;
  /**
   * Automaticaly set the dirty set without the need of `$value` or `$touch`
   * @default true
   */
  autoDirty?: boolean;
  /**
   * The fields will turn valid when they are, but not invalid unless calling `r$.$validate()`
   * @default false
   *
   */
  rewardEarly?: boolean;
  /**
   * Define wether or not the external errors should be cleared when updating a field
   * @default true
   *
   */
  clearExternalErrorsOnChange?: boolean;
}

export interface LocalRegleBehaviourOptions<
  TState extends Record<string, any>,
  TRules extends ReglePartialRuleTree<TState, CustomRulesDeclarationTree>,
  TValidationGroups extends Record<string, RegleValidationGroupEntry[]> = {},
> {
  externalErrors?: Ref<RegleExternalErrorTree<Unwrap<TState>>>;
  validationGroups?: (fields: RegleStatus<TState, TRules>['$fields']) => TValidationGroups;
}

export type RegleValidationGroupEntry = RegleFieldStatus<any, any>;

export interface RegleValidationGroupOutput {
  $invalid: boolean;
  $error: boolean;
  $pending: boolean;
  $dirty: boolean;
  $valid: boolean;
  $errors: string[];
  $silentErrors: string[];
}

export type FieldRegleBehaviourOptions = AddDollarToOptions<RegleBehaviourOptions> & {
  $debounce?: number;
};

export type ResolvedRegleBehaviourOptions = DeepMaybeRef<RequiredDeep<RegleBehaviourOptions>> &
  LocalRegleBehaviourOptions<Record<string, any>, Record<string, any>, Record<string, any[]>>;

export type ShortcutCommonFn<T extends Record<string, any>> = {
  [x: string]: (element: OmitByType<T, Function>) => unknown;
};

export type RegleShortcutDefinition<TCustomRules extends Record<string, any> = {}> = {
  fields?: ShortcutCommonFn<
    RegleFieldStatus<any, Partial<TCustomRules> & Partial<DefaultValidators>>
  >;
  nested?: ShortcutCommonFn<
    RegleStatus<
      Record<string, any>,
      ReglePartialRuleTree<any, Partial<TCustomRules> & Partial<DefaultValidators>>
    >
  >;
  collections?: ShortcutCommonFn<
    RegleCollectionStatus<any[], Partial<TCustomRules> & Partial<DefaultValidators>>
  >;
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
