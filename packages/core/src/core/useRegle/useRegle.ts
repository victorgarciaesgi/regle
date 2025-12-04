import type { ComputedRef, MaybeRef, MaybeRefOrGetter, Ref } from 'vue';
import { isRef, ref } from 'vue';
import type {
  AllRulesDeclarations,
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
    ReglePartialRuleTree<Unwrap<TState extends Record<string, any> ? TState : {}>, Partial<AllRulesDeclarations>>
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
  TCustomRules extends Partial<AllRulesDeclarations>,
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
        Partial<AllRulesDeclarations> & Partial<TCustomRules>
      >
    >,
    TDecl extends RegleRuleDecl<NonNullable<TState>, Partial<AllRulesDeclarations> & Partial<TCustomRules>>,
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
  TCustomRules extends Partial<AllRulesDeclarations>,
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
 * useRegle serves as the foundation for validation logic.
 *
 * It accepts the following inputs:
 *
 * @param state - This can be a plain object, a ref, a reactive object, or a structure containing nested refs.
 * @param rules - These should align with the structure of your state.
 * @param modifiers - Customize regle behaviour
 * 
 * ```ts
 * import { useRegle } from '@regle/core';
   import { required } from '@regle/rules';

   const { r$ } = useRegle({ email: '' }, {
     email: { required }
   })
 * ```
 * Docs: {@link https://reglejs.dev/core-concepts/}  
 */
export const useRegle = createUseRegleComposable();
