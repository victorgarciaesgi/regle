import { ComputedRef, Ref, computed, isRef, shallowRef, toRaw } from 'vue';
import {
  $InternalReglePartialValidationTree,
  AllRulesDeclarations,
  Regle,
  RegleErrorTree,
  ReglePartialValidationTree,
  RegleStatus,
} from '../../types';
import { useStateProperties } from './useStateProperties';
import { PartialDeep } from 'type-fest';
import { DeepSafeFormState } from 'types/core/useRegle.type';

export function createUseRegleComposable<TCustomRules extends Partial<AllRulesDeclarations>>(
  customRules?: () => TCustomRules
) {
  function useRegle<
    TState extends Record<string, any>,
    TRules extends ReglePartialValidationTree<TState, Partial<AllRulesDeclarations> & TCustomRules>,
  >(state: Ref<TState>, rulesFactory: (() => TRules) | ComputedRef<TRules>): Regle<TState, TRules> {
    const scopeRules = isRef(rulesFactory) ? rulesFactory : computed(rulesFactory);

    const initialState = shallowRef<TState>(structuredClone(toRaw(state.value)));

    const { $regle, errors } = useStateProperties(
      scopeRules as ComputedRef<$InternalReglePartialValidationTree>,
      state,
      customRules
    );

    function resetForm() {
      state.value = toRaw(initialState.value) as TState;
      $regle.$reset();
    }

    async function validateForm(): Promise<false | DeepSafeFormState<TState, TRules>> {
      $regle.$touch();
      const result = await $regle.$validate();
      if (result) {
        return state.value as any;
      }
      return false;
    }

    return {
      state: state as Ref<PartialDeep<TState>>,
      $regle: $regle as RegleStatus<TState, TRules>,
      errors: errors as RegleErrorTree<TRules>,
      resetForm,
      validateForm,
    };
  }

  return useRegle;
}

export const useRegle = createUseRegleComposable();
