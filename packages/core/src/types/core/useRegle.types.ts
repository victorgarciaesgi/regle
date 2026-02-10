import type { EmptyObject } from 'type-fest';
import type { MaybeRef, Raw } from 'vue';
import type {
  CustomRulesDeclarationTree,
  RegleFieldStatus,
  ReglePartialRuleTree,
  RegleRoot,
  RegleRuleDecl,
} from '../rules';
import type { ExtendOnlyRealRecord, Maybe, PrimitiveTypes } from '../utils';
import type { RegleShortcutDefinition, RegleValidationGroupEntry } from './modifiers.types';

/**
 * The main Regle type that represents a complete validation instance.
 *
 * @template TState - The shape of the state object being validated
 * @template TRules - The validation rules tree for the state
 * @template TValidationGroups - Groups of validation rules that can be run together
 * @template TShortcuts - Custom shortcut definitions for common validation patterns
 * @template TAdditionalReturnProperties - Additional properties to extend the return type
 *
 */
export type Regle<
  TState extends Record<string, any> = EmptyObject,
  TRules extends ReglePartialRuleTree<TState, CustomRulesDeclarationTree> = EmptyObject,
  TValidationGroups extends Record<string, RegleValidationGroupEntry[]> = {},
  TShortcuts extends RegleShortcutDefinition = {},
  TAdditionalReturnProperties extends Record<string, any> = {},
> = {
  /**
   * r$ is a reactive object containing the values, errors, dirty state and all the necessary validations properties you'll need to display information.
   *
   * To see the list of properties: {@link https://reglejs.dev/core-concepts/validation-properties}
   */
  r$: Raw<RegleRoot<TState, TRules, TValidationGroups, TShortcuts>>;
} & TAdditionalReturnProperties;

/**
 * The type for a single field validation instance.
 *
 * @template TState - The type of the state value being validated
 * @template TRules - The validation rules for the field
 * @template TShortcuts - Custom shortcut definitions for common validation patterns
 * @template TAdditionalReturnProperties - Additional properties to extend the return type
 */
export type RegleSingleField<
  TState extends Maybe<PrimitiveTypes> = any,
  TRules extends RegleRuleDecl<NonNullable<TState>, CustomRulesDeclarationTree> = EmptyObject,
  TShortcuts extends RegleShortcutDefinition = {},
  TAdditionalReturnProperties extends Record<string, any> = {},
> = {
  /**
   * r$ is a reactive object containing the values, errors, dirty state and all the necessary validations properties you'll need to display information.
   *
   * To see the list of properties: {@link https://reglejs.dev/core-concepts/validation-properties}
   */
  r$: Raw<RegleFieldStatus<TState, TRules, TShortcuts>>;
} & TAdditionalReturnProperties;

export type DeepReactiveState<T extends Record<string, any> | unknown | undefined> =
  ExtendOnlyRealRecord<T> extends true
    ? {
        [K in keyof T]: InferDeepReactiveState<T[K]>;
      }
    : never;

export type InferDeepReactiveState<TState> =
  NonNullable<TState> extends Array<infer U extends Record<string, any>>
    ? DeepReactiveState<U[]>
    : NonNullable<TState> extends Date | File
      ? MaybeRef<TState>
      : NonNullable<TState> extends Record<string, any>
        ? DeepReactiveState<TState>
        : MaybeRef<TState>;
