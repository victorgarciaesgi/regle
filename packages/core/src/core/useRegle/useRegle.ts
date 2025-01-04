import type { RequiredDeep } from 'type-fest';
import type { ComputedRef, MaybeRef, MaybeRefOrGetter, Ref } from 'vue';
import { computed, isRef, ref } from 'vue';
import type {
  $InternalReglePartialRuleTree,
  AllRulesDeclarations,
  DeepReactiveState,
  isDeepExact,
  LocalRegleBehaviourOptions,
  Regle,
  RegleBehaviourOptions,
  ReglePartialRuleTree,
  RegleShortcutDefinition,
  RegleValidationGroupEntry,
  ResolvedRegleBehaviourOptions,
} from '../../types';
import type { DeepMaybeRef, MismatchInfo, NoInferLegacy, Unwrap } from '../../types/utils';
import { cloneDeep } from '../../../../shared';
import { useRootStorage } from './root';

export type useRegleFn<
  TCustomRules extends Partial<AllRulesDeclarations>,
  TShortcuts extends RegleShortcutDefinition<any> = never,
> = <
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
    LocalRegleBehaviourOptions<Unwrap<TState>, TRules, TValidationGroups>
) => Regle<Unwrap<TState>, TRules, TValidationGroups, TShortcuts>;

export function createUseRegleComposable<
  TCustomRules extends Partial<AllRulesDeclarations>,
  TShortcuts extends RegleShortcutDefinition<any>,
>(
  customRules?: () => TCustomRules,
  options?: RegleBehaviourOptions,
  shortcuts?: RegleShortcutDefinition | undefined
): useRegleFn<TCustomRules, TShortcuts> {
  const globalOptions: RequiredDeep<RegleBehaviourOptions> = {
    autoDirty: options?.autoDirty ?? true,
    lazy: options?.lazy ?? false,
    rewardEarly: options?.rewardEarly ?? false,
    clearExternalErrorsOnChange: options?.clearExternalErrorsOnChange ?? true,
  };

  function useRegle(
    state: MaybeRef<Record<string, any>> | DeepReactiveState<Record<string, any>>,
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

    const processedState = (isRef(state) ? state : ref(state)) as Ref<Record<string, any>>;

    const initialState = { ...cloneDeep(processedState.value) };

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
