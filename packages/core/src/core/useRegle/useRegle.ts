import type { RequiredDeep } from 'type-fest';
import type { ComputedRef, MaybeRef, Ref } from 'vue';
import { computed, isRef, ref, toRaw } from 'vue';
import type {
  $InternalReglePartialValidationTree,
  AllRulesDeclarations,
  DeepReactiveState,
  DeepSafeFormState,
  LocalRegleBehaviourOptions,
  Regle,
  RegleBehaviourOptions,
  RegleErrorTree,
  RegleExternalErrorTree,
  ReglePartialValidationTree,
  RegleStatus,
  RegleValidationGroupEntry,
  ResolvedRegleBehaviourOptions,
} from '../../types';
import type { DeepMaybeRef, Unwrap } from '../../types/utils';
import { cloneDeep, isObject } from '../../utils';
import { useStateProperties } from './useStateProperties';

export function createUseRegleComposable<TCustomRules extends Partial<AllRulesDeclarations>>(
  customRules?: () => TCustomRules,
  options?: RegleBehaviourOptions
) {
  const globalOptions: RequiredDeep<RegleBehaviourOptions> = {
    autoDirty: options?.autoDirty ?? true,
    lazy: options?.lazy ?? false,
    rewardEarly: options?.rewardEarly ?? false,
  };

  function useRegle<
    TState extends Record<string, any>,
    TRules extends ReglePartialValidationTree<
      Unwrap<TState>,
      Partial<AllRulesDeclarations> & TCustomRules
    >,
    TExternal extends RegleExternalErrorTree<Unwrap<TState>>,
    TValidationGroups extends Record<string, RegleValidationGroupEntry[]>,
    TValid = keyof TRules extends keyof ReglePartialValidationTree<
      Unwrap<TState>,
      Partial<AllRulesDeclarations> & TCustomRules
    >
      ? true
      : false,
  >(
    state: MaybeRef<TState> | DeepReactiveState<TState>,
    rulesFactory: TValid extends true ? TRules | (() => TRules) | ComputedRef<TRules> : never,
    options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> &
      LocalRegleBehaviourOptions<Unwrap<TState>, TRules, TExternal, TValidationGroups>
  ): Regle<Unwrap<TState>, TRules, TExternal, TValidationGroups> {
    const scopeRules = isRef(rulesFactory)
      ? rulesFactory
      : computed(
          (typeof (rulesFactory as TRules | (() => TRules)) === 'function'
            ? rulesFactory
            : () => rulesFactory) as any
        );

    const resolvedOptions: ResolvedRegleBehaviourOptions = {
      ...globalOptions,
      ...options,
    } as any;

    const processedState = isRef(state) ? state : (ref(state) as Ref<Unwrap<TState>>);

    const initialState = cloneDeep(toRaw(processedState.value));

    const { regle, errors } = useStateProperties(
      scopeRules as ComputedRef<$InternalReglePartialValidationTree>,
      processedState,
      resolvedOptions,
      customRules
    );

    function resetAll() {
      regle.$unwatch();
      resetValuesRecursively(state, initialState);
      regle.$reset();
    }

    function resetValuesRecursively(
      current: Ref<Record<string, MaybeRef<any>>> | Record<string, MaybeRef<any>>,
      initial: Record<string, MaybeRef<any>>
    ) {
      Object.entries(initial).forEach(([key, value]) => {
        let currentRef = isRef<Record<string, MaybeRef<any>>>(current) ? current.value : current;
        let currentValue = isRef(currentRef[key]) ? currentRef[key].value : currentRef[key];
        let initialRef = isRef(initial[key]) ? (initial[key] as any)._value : initial[key];
        if (Array.isArray(initialRef) && Array.isArray(currentValue)) {
          currentRef[key] = [];
          initialRef.forEach((val, index) => {
            currentRef[key][index] = {};
            resetValuesRecursively(currentRef[key][index], initialRef[index]);
          });
        } else if (isObject(initialRef)) {
          resetValuesRecursively(currentValue, initialRef);
        } else {
          if (isRef(currentRef[key])) {
            currentRef[key].value = initialRef;
          } else {
            currentRef[key] = initialRef;
          }
        }
      });
    }

    const ready = computed<boolean>(() => {
      return !(regle.$invalid || regle.$pending);
    });

    async function validateState(): Promise<false | DeepSafeFormState<Unwrap<TState>, TRules>> {
      regle.$touch();
      const result = await regle.$validate();
      if (result) {
        return processedState.value as any;
      }
      return false;
    }

    return {
      regle: regle as unknown as RegleStatus<Unwrap<TState>, TRules, TValidationGroups>,
      r$: regle as unknown as RegleStatus<Unwrap<TState>, TRules, TValidationGroups>,
      errors: errors as RegleErrorTree<TRules>,
      resetAll,
      validateState,
      ready,
      state: processedState as any,
    };
  }

  return useRegle;
}

export const useRegle = createUseRegleComposable();
