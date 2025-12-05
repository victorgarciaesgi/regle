import type { ComputedRef, MaybeRef, MaybeRefOrGetter, Ref } from 'vue';
import { isRef, ref } from 'vue';
import type {
  ExtendedRulesDeclarations,
  CustomRulesDeclarationTree,
  DeepReactiveState,
  LocalRegleBehaviourOptions,
  Regle,
  RegleBehaviourOptions,
  ReglePartialRuleTree,
  RegleRuleDecl,
  RegleShortcutDefinition,
  RegleSingleField,
  RegleValidationGroupEntry,
} from '../../types';
import type {
  DeepExact,
  DeepMaybeRef,
  HaveAnyRequiredProps,
  JoinDiscriminatedUnions,
  Maybe,
  MaybeInput,
  MaybeRefOrComputedRef,
  PrimitiveTypes,
  Unwrap,
} from '../../types/utils';
import { createRootRegleLogic } from './shared.rootRegle';

export type useRegleFnOptions<
  TState extends Record<string, any> | MaybeInput<PrimitiveTypes>,
  TRules extends DeepExact<
    TRules,
    ReglePartialRuleTree<Unwrap<TState extends Record<string, any> ? TState : {}>, Partial<ExtendedRulesDeclarations>>
  >,
  TAdditionalOptions extends Record<string, any>,
  TValidationGroups extends Record<string, RegleValidationGroupEntry[]>,
> =
  TState extends MaybeInput<PrimitiveTypes>
    ? Partial<DeepMaybeRef<RegleBehaviourOptions>> & TAdditionalOptions
    : Partial<DeepMaybeRef<RegleBehaviourOptions>> &
        LocalRegleBehaviourOptions<
          JoinDiscriminatedUnions<TState extends Record<string, any> ? Unwrap<TState> : {}>,
          TState extends Record<string, any> ? (TRules extends Record<string, any> ? TRules : {}) : {},
          TValidationGroups
        > &
        TAdditionalOptions;

export interface useRegleFn<
  TCustomRules extends Partial<ExtendedRulesDeclarations>,
  TShortcuts extends RegleShortcutDefinition<any> = never,
  TAdditionalReturnProperties extends Record<string, any> = {},
  TAdditionalOptions extends Record<string, any> = {},
> {
  <
    TState extends Record<string, any> | MaybeInput<PrimitiveTypes>,
    TRules extends DeepExact<
      TRules,
      ReglePartialRuleTree<
        Unwrap<TState extends Record<string, any> ? TState : {}>,
        Partial<ExtendedRulesDeclarations> & Partial<TCustomRules>
      >
    >,
    TDecl extends RegleRuleDecl<NonNullable<TState>, Partial<ExtendedRulesDeclarations> & Partial<TCustomRules>>,
    TValidationGroups extends Record<string, RegleValidationGroupEntry[]>,
  >(
    ...params: [
      state: Maybe<MaybeRef<TState> | DeepReactiveState<TState>>,
      rulesFactory: TState extends MaybeInput<PrimitiveTypes>
        ? MaybeRefOrGetter<TDecl>
        : TState extends Record<string, any>
          ? MaybeRefOrComputedRef<TRules> | ((...args: any[]) => TRules)
          : {},
      ...(HaveAnyRequiredProps<useRegleFnOptions<TState, TRules, TAdditionalOptions, TValidationGroups>> extends true
        ? [options: useRegleFnOptions<TState, TRules, TAdditionalOptions, TValidationGroups>]
        : [options?: useRegleFnOptions<TState, TRules, TAdditionalOptions, TValidationGroups>]),
    ]
  ): NonNullable<TState> extends PrimitiveTypes
    ? RegleSingleField<NonNullable<TState>, TDecl, TShortcuts, TAdditionalReturnProperties>
    : Regle<
        TState extends Record<string, any> ? Unwrap<TState> : {},
        TRules extends Record<string, any> ? TRules : {},
        TValidationGroups,
        TShortcuts,
        TAdditionalReturnProperties
      >;
  __config?: {
    rules?: () => CustomRulesDeclarationTree;
    modifiers?: RegleBehaviourOptions;
    shortcuts?: TShortcuts;
  };
}

export function createUseRegleComposable<
  TCustomRules extends Partial<ExtendedRulesDeclarations>,
  TShortcuts extends RegleShortcutDefinition<any>,
>(
  customRules?: () => TCustomRules,
  options?: RegleBehaviourOptions,
  shortcuts?: RegleShortcutDefinition | undefined
): useRegleFn<TCustomRules, TShortcuts> {
  const globalOptions: RegleBehaviourOptions = {
    autoDirty: options?.autoDirty,
    lazy: options?.lazy,
    rewardEarly: options?.rewardEarly,
    silent: options?.silent,
    clearExternalErrorsOnChange: options?.clearExternalErrorsOnChange,
  };

  function useRegle(
    state: MaybeRef<Record<string, any>> | DeepReactiveState<Record<string, any>> | PrimitiveTypes,
    rulesFactory: Record<string, any> | ((...args: any[]) => Record<string, any>) | ComputedRef<Record<string, any>>,
    options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> &
      LocalRegleBehaviourOptions<Record<string, any>, Record<string, any>, any>
  ): Regle<Record<string, any>, Record<string, any>, any, any> {
    const processedState = (isRef(state) ? state : ref(state)) as Ref<Record<string, any> | PrimitiveTypes>;

    const regle = createRootRegleLogic({
      state: processedState,
      rulesFactory,
      options,
      globalOptions,
      customRules,
      shortcuts,
    });

    return {
      r$: regle.regle as any,
    };
  }

  return useRegle as any;
}

/**
 * `useRegle` serves as the foundation for validation logic.
 * It transforms your data and validation rules into a powerful, reactive validation system.
 *
 * @param state - Your form data (plain object, ref, reactive object, or structure with nested refs)
 * @param rules - Validation rules that should align with the structure of your state
 * @param modifiers - Optional configuration to customize regle behavior
 * @returns An object containing `r$` - the reactive validation state
 *
 * @example
 * ```ts
 * import { useRegle } from '@regle/core';
 * import { required, email, minLength } from '@regle/rules';
 *
 * const { r$ } = useRegle(
 *   { name: '', email: '' },
 *   {
 *     name: { required, minLength: minLength(2) },
 *     email: { required, email }
 *   }
 * );
 *
 * // Access validation state
 * r$.$valid        // Whether all validations pass
 * r$.$value        // The current form values
 * r$.name.$errors  // Errors for the name field
 *
 * // Trigger validation
 * const result = await r$.$validate();
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/ Documentation}
 */
export const useRegle = createUseRegleComposable();
