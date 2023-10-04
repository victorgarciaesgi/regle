import { ComputedRef, Ref, computed, isRef, shallowRef, toRaw } from 'vue';
import {
  AllRulesDeclarations,
  CustomRulesDeclarationTree,
  ReglePartialValidationTree,
  RegleStatus,
} from '../../types';
import { useRegle } from './useRegle';

export function createUseFormComposable<TCustomRules extends CustomRulesDeclarationTree>(
  customRules: () => TCustomRules
) {
  function useForm<
    TState extends Record<string, any>,
    TRules extends ReglePartialValidationTree<TState, AllRulesDeclarations & TCustomRules>,
  >(state: Ref<TState>, rulesFactory: (() => TRules) | ComputedRef<TRules>) {
    const scopeRules = isRef(rulesFactory) ? rulesFactory : computed(rulesFactory);

    const initialState = shallowRef(structuredClone(toRaw(state.value)));

    const { $regle } = useRegle(scopeRules, state, customRules);

    return {
      state,
      $regle: $regle as RegleStatus<TState, TRules>,
    };
  }

  return useForm;
}
