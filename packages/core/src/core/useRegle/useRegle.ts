import { ComputedRef, Ref, computed, isRef, shallowRef, toRaw } from 'vue';
import {
  $InternalReglePartialValidationTree,
  AllRulesDeclarations,
  Regle,
  RegleBehaviourOptions,
  RegleErrorTree,
  ReglePartialValidationTree,
  RegleStatus,
} from '../../types';
import { useStateProperties } from './useStateProperties';
import { PartialDeep, RequiredDeep } from 'type-fest';
import { DeepSafeFormState } from 'types/core/useRegle.types';
import { DeepMaybeRef } from 'types/utils';

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
  >(
    state: Ref<TState>,
    rulesFactory: (() => TRules) | ComputedRef<TRules>,
    options?: Partial<DeepMaybeRef<Required<RegleBehaviourOptions>>>
  ): Regle<TState, TRules> {
    const scopeRules = isRef(rulesFactory) ? rulesFactory : computed(rulesFactory);
    const resolvedOptions: DeepMaybeRef<RequiredDeep<RegleBehaviourOptions>> = {
      ...globalOptions,
      ...options,
    };

    const initialState = shallowRef<TState>(structuredClone(toRaw(state.value)));

    const { $regle, errors } = useStateProperties(
      scopeRules as ComputedRef<$InternalReglePartialValidationTree>,
      state,
      resolvedOptions,
      customRules
    );

    function resetForm() {
      state.value = toRaw(initialState.value) as TState;
      $regle.$reset();
    }

    const $valid = computed<boolean>(() => {
      return $regle.$valid && $regle.$dirty && !$regle.$pending;
    });

    const $invalid = computed<boolean>(() => {
      return ($regle.$invalid && $regle.$dirty) || $regle.$pending;
    });

    async function validateForm(): Promise<false | DeepSafeFormState<TState, TRules>> {
      $regle.$touch();
      const result = await $regle.$validate();
      if (result) {
        return state.value as any;
      }
      return false;
    }

    return {
      $state: state as Ref<PartialDeep<TState>>,
      $regle: $regle as RegleStatus<TState, TRules>,
      $errors: errors as RegleErrorTree<TRules>,
      resetForm,
      validateForm,
      $valid,
      $invalid,
    };
  }

  return useRegle;
}

export const useRegle = createUseRegleComposable();
