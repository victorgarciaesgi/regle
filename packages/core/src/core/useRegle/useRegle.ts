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
  ReglePartialValidationTree,
  RegleStatus,
  ResolvedRegleBehaviourOptions,
} from '../../types';
import type { DeepMaybeRef } from '../../types/utils';
import { isObject } from '../../utils';
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
    TRules extends ReglePartialValidationTree<TState, Partial<AllRulesDeclarations> & TCustomRules>,
    TValid = keyof TRules extends keyof ReglePartialValidationTree<
      TState,
      Partial<AllRulesDeclarations> & TCustomRules
    >
      ? true
      : false,
  >(
    state: Ref<TState> | DeepReactiveState<TState>,
    rulesFactory: TValid extends true ? TRules | (() => TRules) | ComputedRef<TRules> : never,
    options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> & LocalRegleBehaviourOptions<TState>
  ): Regle<TState, TRules> {
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

    const processedState = isRef(state) ? state : (ref(state) as Ref<TState>);

    const initialState = structuredClone(toRaw(processedState.value));

    const { regle, errors } = useStateProperties(
      scopeRules as ComputedRef<$InternalReglePartialValidationTree>,
      processedState,
      resolvedOptions,
      customRules
    );

    function resetForm() {
      regle.$unwatch();
      resetValuesRecursively(state, initialState);
      regle.$reset();
      regle.$validate();
    }

    function resetValuesRecursively(
      origin: Ref<Record<string, MaybeRef<any>>> | Record<string, MaybeRef<any>>,
      state: Record<string, MaybeRef<any>>
    ) {
      Object.entries(state).forEach(([key, value]) => {
        let originRef = isRef<Record<string, MaybeRef<any>>>(origin) ? origin.value : origin;
        let originValue = isRef(originRef[key]) ? originRef[key].value : originRef[key];
        const stateRef = isRef(state[key]) ? state[key]._value : state[key];
        if (Array.isArray(stateRef) && Array.isArray(originValue)) {
          stateRef.forEach((val, index) => {
            resetValuesRecursively(originValue[index], stateRef[index]);
          });
        } else if (isObject(stateRef)) {
          resetValuesRecursively(originValue, stateRef);
        } else {
          if (isRef(originRef[key])) {
            originRef[key].value = stateRef;
          } else {
            originRef[key] = stateRef;
          }
        }
      });
    }

    const invalid = computed<boolean>(() => {
      return regle.$invalid || regle.$pending;
    });

    async function validateForm(): Promise<false | DeepSafeFormState<TState, TRules>> {
      regle.$touch();
      const result = await regle.$validate();
      if (result) {
        return processedState.value as any;
      }
      return false;
    }

    regle.$validate();

    return {
      regle: regle as RegleStatus<TState, TRules>,
      errors: errors as RegleErrorTree<TRules>,
      resetForm,
      validateForm,
      invalid,
    };
  }

  return useRegle;
}

export const useRegle = createUseRegleComposable();
