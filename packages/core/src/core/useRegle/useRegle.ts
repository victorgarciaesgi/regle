import type { ComputedRef, MaybeRef, MaybeRefOrGetter, Ref } from 'vue';
import { computed, isRef, ref, watchEffect, watch, shallowRef, triggerRef } from 'vue';
import { cloneDeep, isObject } from '../../../../shared';
import type {
  $InternalReglePartialRuleTree,
  AllRulesDeclarations,
  CustomRulesDeclarationTree,
  DeepReactiveState,
  LocalRegleBehaviourOptions,
  Regle,
  RegleBehaviourOptions,
  ReglePartialRuleTree,
  RegleRuleDecl,
  RegleRuleTree,
  RegleShortcutDefinition,
  RegleSingleField,
  RegleValidationGroupEntry,
  ResolvedRegleBehaviourOptions,
} from '../../types';
import type {
  DeepMaybeRef,
  HaveAnyRequiredProps,
  isDeepExact,
  JoinDiscriminatedUnions,
  Maybe,
  MaybeInput,
  NoInferLegacy,
  PrimitiveTypes,
  Unwrap,
} from '../../types/utils';
import { useRootStorage } from './root';
import type { MismatchInfo } from 'expect-type';

export type useRegleFnOptions<
  TState extends Record<string, any> | MaybeInput<PrimitiveTypes>,
  TRules extends ReglePartialRuleTree<
    Unwrap<TState extends Record<string, any> ? TState : {}>,
    Partial<AllRulesDeclarations>
  >,
  TAdditionalOptions extends Record<string, any>,
  TValidationGroups extends Record<string, RegleValidationGroupEntry[]>,
> =
  TState extends MaybeInput<PrimitiveTypes>
    ? Partial<DeepMaybeRef<RegleBehaviourOptions>> & TAdditionalOptions
    : Partial<DeepMaybeRef<RegleBehaviourOptions>> &
        LocalRegleBehaviourOptions<
          JoinDiscriminatedUnions<TState extends Record<string, any> ? Unwrap<TState> : {}>,
          TState extends Record<string, any> ? TRules : {},
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
    TRules extends ReglePartialRuleTree<
      Unwrap<TState extends Record<string, any> ? TState : {}>,
      Partial<AllRulesDeclarations> & TCustomRules
    > &
      TValid,
    TDecl extends RegleRuleDecl<NonNullable<TState>, Partial<AllRulesDeclarations> & TCustomRules>,
    TValidationGroups extends Record<string, RegleValidationGroupEntry[]>,
    TValid = isDeepExact<NoInferLegacy<TRules>, Unwrap<TState extends Record<string, any> ? TState : {}>> extends true
      ? {}
      : MismatchInfo<
          RegleRuleTree<
            Unwrap<TState extends Record<string, any> ? TState : {}>,
            Partial<AllRulesDeclarations> & TCustomRules
          >,
          NoInferLegacy<TRules>
        >,
  >(
    ...params: [
      state: Maybe<MaybeRef<TState> | DeepReactiveState<TState>>,
      rulesFactory: TState extends MaybeInput<PrimitiveTypes>
        ? MaybeRefOrGetter<TDecl>
        : TState extends Record<string, any>
          ? MaybeRef<TRules> | ((...args: any[]) => TRules)
          : {},
      ...(HaveAnyRequiredProps<useRegleFnOptions<TState, TRules, TAdditionalOptions, TValidationGroups>> extends true
        ? [options: useRegleFnOptions<TState, TRules, TAdditionalOptions, TValidationGroups>]
        : [options?: useRegleFnOptions<TState, TRules, TAdditionalOptions, TValidationGroups>]),
    ]
  ): NonNullable<TState> extends PrimitiveTypes
    ? RegleSingleField<NonNullable<TState>, TDecl, TShortcuts, TAdditionalReturnProperties>
    : Regle<
        TState extends Record<string, any> ? Unwrap<TState> : {},
        TRules,
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
    const definedRules = isRef(rulesFactory)
      ? rulesFactory
      : typeof rulesFactory === 'function'
        ? undefined
        : computed(() => rulesFactory);

    const resolvedOptions: ResolvedRegleBehaviourOptions = {
      ...globalOptions,
      ...options,
    } as any;

    const processedState = (isRef(state) ? state : ref(state)) as Ref<Record<string, any> | PrimitiveTypes>;

    const watchableRulesGetters = shallowRef<Record<string, any> | null>(definedRules ?? {});

    if (typeof rulesFactory === 'function') {
      watchEffect(() => {
        watchableRulesGetters.value = rulesFactory(processedState);
        triggerRef(watchableRulesGetters);
      });
    }

    const initialState = ref(
      isObject(processedState.value) ? { ...cloneDeep(processedState.value) } : cloneDeep(processedState.value)
    );

    const regle = useRootStorage({
      scopeRules: watchableRulesGetters as ComputedRef<$InternalReglePartialRuleTree>,
      state: processedState,
      options: resolvedOptions,
      initialState,
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
