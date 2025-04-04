import type { ComputedRef, MaybeRef, MaybeRefOrGetter, Ref } from 'vue';
import { computed, isRef, ref } from 'vue';
import { cloneDeep, isObject } from '../../../../shared';
import type {
  $InternalReglePartialRuleTree,
  AllRulesDeclarations,
  DeepReactiveState,
  isDeepExact,
  LocalRegleBehaviourOptions,
  Regle,
  RegleBehaviourOptions,
  ReglePartialRuleTree,
  RegleRuleDecl,
  RegleShortcutDefinition,
  RegleSingleField,
  RegleValidationGroupEntry,
  ResolvedRegleBehaviourOptions,
} from '../../types';
import type { DeepMaybeRef, Maybe, MismatchInfo, NoInferLegacy, PrimitiveTypes, Unwrap } from '../../types/utils';
import { useRootStorage } from './root';

export interface useRegleFn<
  TCustomRules extends Partial<AllRulesDeclarations>,
  TShortcuts extends RegleShortcutDefinition<any> = never,
  TAdditionalReturnProperties extends Record<string, any> = {},
  TAdditionalOptions extends Record<string, any> = {},
> {
  /**
   * Primitive parameter
   * */
  <TState extends Maybe<PrimitiveTypes>, TRules extends RegleRuleDecl<NonNullable<TState>, TCustomRules>>(
    state: MaybeRef<TState>,
    rulesFactory: MaybeRefOrGetter<TRules>,
    options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> & TAdditionalOptions
  ): RegleSingleField<TState, TRules, TShortcuts, TAdditionalReturnProperties>;
  /**
   * Object parameter
   * */
  <
    TState extends Record<string, any>,
    TRules extends ReglePartialRuleTree<Unwrap<TState>, Partial<AllRulesDeclarations> & TCustomRules> & TValid,
    TValidationGroups extends Record<string, RegleValidationGroupEntry[]>,
    TValid = isDeepExact<
      NoInferLegacy<TRules>,
      ReglePartialRuleTree<Unwrap<TState>, Partial<AllRulesDeclarations> & TCustomRules>
    > extends true
      ? {}
      : MismatchInfo<
          NoInferLegacy<TRules>,
          ReglePartialRuleTree<Unwrap<TState>, Partial<AllRulesDeclarations> & TCustomRules>
        >,
  >(
    state: MaybeRef<TState> | DeepReactiveState<TState>,
    rulesFactory: MaybeRefOrGetter<TRules>,
    options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> &
      LocalRegleBehaviourOptions<Unwrap<TState>, TRules, TValidationGroups> &
      TAdditionalOptions
  ): Regle<Unwrap<TState>, TRules, TValidationGroups, TShortcuts, TAdditionalReturnProperties>;
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
    clearExternalErrorsOnChange: options?.clearExternalErrorsOnChange,
  };

  function useRegle(
    state: MaybeRef<Record<string, any>> | DeepReactiveState<Record<string, any>> | PrimitiveTypes,
    rulesFactory: Record<string, any> | (() => Record<string, any>) | ComputedRef<Record<string, any>>,
    options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> &
      LocalRegleBehaviourOptions<Record<string, any>, Record<string, any>, any>
  ): Regle<Record<string, any>, Record<string, any>, any, any> {
    const scopeRules = isRef(rulesFactory)
      ? rulesFactory
      : computed((typeof rulesFactory === 'function' ? rulesFactory : () => rulesFactory) as any);

    const resolvedOptions: ResolvedRegleBehaviourOptions = {
      ...globalOptions,
      ...options,
    } as any;

    const processedState = (isRef(state) ? state : ref(state)) as Ref<Record<string, any> | PrimitiveTypes>;

    const initialState = ref(
      isObject(processedState.value) ? { ...cloneDeep(processedState.value) } : cloneDeep(processedState.value)
    );

    const regle = useRootStorage({
      scopeRules: scopeRules as ComputedRef<$InternalReglePartialRuleTree>,
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
