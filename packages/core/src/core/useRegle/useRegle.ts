import type { RequiredDeep } from 'type-fest';
import type { ComputedRef, MaybeRef, MaybeRefOrGetter, Ref } from 'vue';
import { computed, isRef, ref, toRaw, watch } from 'vue';
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
import type { DeepMaybeRef, NoInferLegacy, Unwrap } from '../../types/utils';
import { cloneDeep } from '../../utils';
import { useStateProperties } from './useStateProperties';

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
    : never,
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

    const regle = useStateProperties({
      scopeRules: scopeRules as ComputedRef<$InternalReglePartialRuleTree>,
      state: processedState,
      options: resolvedOptions,
      initialState,
      customRules,
      shortcuts,
    });

    return {
      r$: regle as any,
    };
  }

  return useRegle as any;
}

export const useRegle = createUseRegleComposable();
