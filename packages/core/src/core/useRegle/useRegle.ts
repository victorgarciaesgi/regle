import { ComputedRef, Ref, computed, isRef, shallowRef, toRaw } from 'vue';
import {
  AllRulesDeclarations,
  CustomRulesDeclarationTree,
  RegleErrorTree,
  ReglePartialValidationTree,
  RegleStatus,
} from '../../types';
import { useStateProperties } from './useStateProperties';

export function createUseRegleComposable<TCustomRules extends Partial<AllRulesDeclarations>>(
  customRules: () => TCustomRules
) {
  function useRegle<
    TState extends Record<string, any>,
    TRules extends ReglePartialValidationTree<TState, AllRulesDeclarations & TCustomRules>,
  >(state: Ref<TState>, rulesFactory: (() => TRules) | ComputedRef<TRules>) {
    const scopeRules = isRef(rulesFactory) ? rulesFactory : computed(rulesFactory);

    const initialState = shallowRef(structuredClone(toRaw(state.value)));

    const { $regle, errors } = useStateProperties(
      scopeRules,
      state,
      customRules as () => CustomRulesDeclarationTree
    );

    return {
      state,
      $regle: $regle as Ref<RegleStatus<TState, TRules>>,
      errors: errors as RegleErrorTree<TRules>,
    };
  }

  return useRegle;
}
