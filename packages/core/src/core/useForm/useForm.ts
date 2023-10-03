import { ComputedRef, Ref, computed, isRef, shallowRef, toRaw } from 'vue';
import {
  AllRulesDeclarations,
  CustomRulesDeclarationTree,
  ShibiePartialValidationTree,
  ShibieStatus,
} from '../../types';
import { useShibie } from './useShibie';

export function createUseFormComposable<TCustomRules extends CustomRulesDeclarationTree>(
  customRules: () => TCustomRules
) {
  function useForm<
    TState extends Record<string, any>,
    TRules extends ShibiePartialValidationTree<TState, AllRulesDeclarations & TCustomRules>,
  >(state: Ref<TState>, rulesFactory: (() => TRules) | ComputedRef<TRules>) {
    const scopeRules = isRef(rulesFactory) ? rulesFactory : computed(rulesFactory);

    const initialState = shallowRef(structuredClone(toRaw(state.value)));

    const { $shibie } = useShibie(scopeRules, state, customRules);

    return {
      state,
      $shibie: $shibie as ShibieStatus<TState, TRules>,
    };
  }

  return useForm;
}
