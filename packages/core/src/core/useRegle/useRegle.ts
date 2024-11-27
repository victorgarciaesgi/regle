import type { RequiredDeep } from 'type-fest';
import type { ComputedRef, MaybeRef, MaybeRefOrGetter, Ref } from 'vue';
import { computed, isRef, ref, toRaw } from 'vue';
import type {
  $InternalReglePartialValidationTree,
  AllRulesDeclarations,
  DeepReactiveState,
  isDeepExact,
  LocalRegleBehaviourOptions,
  Regle,
  RegleBehaviourOptions,
  RegleExternalErrorTree,
  ReglePartialValidationTree,
  RegleValidationGroupEntry,
  ResolvedRegleBehaviourOptions,
} from '../../types';
import type { DeepMaybeRef, NoInferLegacy, Unwrap } from '../../types/utils';
import { cloneDeep } from '../../utils';
import { useStateProperties } from './useStateProperties';

export type useRegleFn<TCustomRules extends Partial<AllRulesDeclarations>> = <
  TState extends Record<string, any>,
  TRules extends ReglePartialValidationTree<
    Unwrap<TState>,
    Partial<AllRulesDeclarations> & TCustomRules
  > &
    TValid,
  TExternal extends RegleExternalErrorTree<Unwrap<TState>>,
  TValidationGroups extends Record<string, RegleValidationGroupEntry[]>,
  TValid = isDeepExact<
    NoInferLegacy<TRules>,
    ReglePartialValidationTree<Unwrap<TState>, Partial<AllRulesDeclarations> & TCustomRules>
  > extends true
    ? {}
    : never,
>(
  state: MaybeRef<TState> | DeepReactiveState<TState>,
  rulesFactory: MaybeRefOrGetter<TRules>,
  options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> &
    LocalRegleBehaviourOptions<Unwrap<TState>, TRules, TExternal, TValidationGroups>
) => Regle<Unwrap<TState>, TRules, TExternal, TValidationGroups>;

export function createUseRegleComposable<TCustomRules extends Partial<AllRulesDeclarations>>(
  customRules?: () => TCustomRules,
  options?: RegleBehaviourOptions
): useRegleFn<TCustomRules> {
  const globalOptions: RequiredDeep<RegleBehaviourOptions> = {
    autoDirty: options?.autoDirty ?? true,
    lazy: options?.lazy ?? false,
    rewardEarly: options?.rewardEarly ?? false,
  };

  function useRegle(
    state: MaybeRef<Record<string, any>> | DeepReactiveState<Record<string, any>>,
    rulesFactory:
      | Record<string, any>
      | (() => Record<string, any>)
      | ComputedRef<Record<string, any>>,
    options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> &
      LocalRegleBehaviourOptions<Record<string, any>, Record<string, any>, any, any>
  ): Regle<Record<string, any>, Record<string, any>, any, any> {
    const scopeRules = isRef(rulesFactory)
      ? rulesFactory
      : computed((typeof rulesFactory === 'function' ? rulesFactory : () => rulesFactory) as any);

    const resolvedOptions: ResolvedRegleBehaviourOptions = {
      ...globalOptions,
      ...options,
    } as any;

    const processedState = (isRef(state) ? state : ref(state)) as Ref<Record<string, any>>;

    const initialState = cloneDeep(toRaw(processedState.value));

    const regle = useStateProperties({
      scopeRules: scopeRules as ComputedRef<$InternalReglePartialValidationTree>,
      state: processedState,
      options: resolvedOptions,
      initialState,
      customRules,
    });

    return {
      r$: regle as any,
    };
  }

  return useRegle as any;
}

export const useRegle = createUseRegleComposable();
