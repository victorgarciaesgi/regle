import type { ComputedRef, MaybeRef, MaybeRefOrGetter, Ref } from 'vue';
import { computed, isRef, ref, toValue } from 'vue';
import { toReactive } from '../../../../shared';
import type {
  CustomRulesDeclarationTree,
  DeepReactiveState,
  DefaultValidatorsTree,
  ExtendedRulesDeclarations,
  ExtendedRulesDeclarationsOverrides,
  FieldOnlyRegleBehaviourOptions,
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
  DeepMaybeRef,
  HaveAnyRequiredProps,
  JoinDiscriminatedUnions,
  Maybe,
  MaybeComputedOrGetter,
  MaybeInput,
  NoInferLegacy,
  PrimitiveTypes,
  Unwrap,
  UnwrapSimple,
  WidenPrimitiveLiterals,
} from '../../types/utils';
import type { GlobalConfigOptions } from '../defineRegleConfig';
import { createRootRegleLogic } from './shared.rootRegle';

export type useRegleFnOptions<
  TState extends Record<string, any> | MaybeInput<PrimitiveTypes>,
  TRules extends ReglePartialRuleTree<NonNullable<JoinDiscriminatedUnions<TState>>, CustomRulesDeclarationTree>,
  TAdditionalOptions extends Record<string, any>,
  TValidationGroups extends Record<string, RegleValidationGroupEntry[]>,
> =
  TState extends Record<string, any>
    ? Partial<DeepMaybeRef<RegleBehaviourOptions>> &
        LocalRegleBehaviourOptions<JoinDiscriminatedUnions<TState>, TRules, TValidationGroups> &
        TAdditionalOptions
    : Partial<DeepMaybeRef<RegleBehaviourOptions & FieldOnlyRegleBehaviourOptions>> & TAdditionalOptions;

export interface useRegleFn<
  TCustomRules extends Partial<ExtendedRulesDeclarationsOverrides>,
  TShortcuts extends RegleShortcutDefinition<any> = never,
  TAdditionalReturnProperties extends Record<string, any> = {},
  TAdditionalOptions extends Record<string, any> = {},
> {
  <
    TState extends MaybeRef<Record<string, any> | MaybeInput<PrimitiveTypes>>,
    TRules extends ReglePartialRuleTree<
      JoinDiscriminatedUnions<Unwrap<TState>>,
      Partial<ExtendedRulesDeclarations & Omit<TCustomRules, keyof DefaultValidatorsTree>>
    >,
    TDecl extends RegleRuleDecl<
      WidenPrimitiveLiterals<NonNullable<Unwrap<TState>>>,
      Partial<ExtendedRulesDeclarations & TCustomRules>
    >,
    TValidationGroups extends Record<string, RegleValidationGroupEntry[]>,
  >(
    ...params: [
      state: Maybe<TState> | DeepReactiveState<TState>,
      rulesFactory: Unwrap<TState> extends MaybeInput<PrimitiveTypes>
        ? MaybeRefOrGetter<TDecl>
        : Unwrap<TState> extends Record<string, any>
          ? MaybeComputedOrGetter<TRules>
          : {},
      ...(HaveAnyRequiredProps<
        useRegleFnOptions<Unwrap<TState>, TRules, TAdditionalOptions, TValidationGroups>
      > extends true
        ? [options: useRegleFnOptions<Unwrap<NoInferLegacy<TState>>, TRules, TAdditionalOptions, TValidationGroups>]
        : [options?: useRegleFnOptions<Unwrap<NoInferLegacy<TState>>, TRules, TAdditionalOptions, TValidationGroups>]),
    ]
  ): NonNullable<Unwrap<TState>> extends PrimitiveTypes
    ? RegleSingleField<
        WidenPrimitiveLiterals<NonNullable<Unwrap<TState>>>,
        TDecl,
        TShortcuts,
        TAdditionalReturnProperties
      >
    : Regle<
        Unwrap<TState> extends Record<string, any> ? Unwrap<TState> : {},
        UnwrapSimple<TRules> extends Record<string, any> ? UnwrapSimple<TRules> : {},
        TValidationGroups,
        TShortcuts,
        TAdditionalReturnProperties
      >;
  __config?: GlobalConfigOptions<TCustomRules, TShortcuts>;
}

export function createUseRegleComposable<
  TCustomRules extends Partial<ExtendedRulesDeclarationsOverrides>,
  TShortcuts extends RegleShortcutDefinition<any>,
>(options?: GlobalConfigOptions<TCustomRules, TShortcuts>): useRegleFn<TCustomRules, TShortcuts> {
  const { rules: customRules, modifiers = {}, shortcuts, overrides } = options ?? {};

  function useRegle(
    state: MaybeRef<Record<string, any>> | DeepReactiveState<Record<string, any>> | PrimitiveTypes,
    rulesFactory: Record<string, any> | ((...args: any[]) => Record<string, any>) | ComputedRef<Record<string, any>>,
    options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> &
      LocalRegleBehaviourOptions<Record<string, any>, Record<string, any>, any>
  ): Regle<Record<string, any>, Record<string, any>, any, any> {
    const processedState = (isRef(state) ? state : ref(state)) as Ref<Record<string, any> | PrimitiveTypes>;

    const isDisabled = computed(() => toValue(options?.disabled) ?? false);

    const regle = createRootRegleLogic({
      state: processedState,
      rulesFactory,
      options,
      globalOptions: modifiers,
      customRules,
      shortcuts,
      overrides,
    });

    return {
      r$: toReactive(regle, isDisabled) as any,
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
