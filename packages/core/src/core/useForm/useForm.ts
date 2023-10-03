import { Ref, computed, effectScope, onScopeDispose, shallowRef, toRaw } from 'vue';
import {
  AllRulesDeclarations,
  CustomRulesDeclarationTree,
  ShibieErrorTree,
  ShibiePartialValidationTree,
} from '../../types';
import { useShibie } from './useShibie';

export function createUseFormComposable<TCustomRules extends CustomRulesDeclarationTree>(
  customRules: () => TCustomRules
) {
  function useForm<
    TState extends Record<string, any>,
    TRules extends ShibiePartialValidationTree<TState, AllRulesDeclarations & TCustomRules>,
  >(state: Ref<TState>, rulesFactory: () => TRules) {
    let effectScopeConstructor = effectScope();

    const scopeRules = computed(rulesFactory);

    const initialState = shallowRef(structuredClone(toRaw(state.value)));

    const { $shibie, errors, rulesResults } = useShibie(scopeRules, state, customRules);

    onScopeDispose(() => {
      if (effectScopeConstructor.active) {
        effectScopeConstructor.stop();
      }
    });

    return {
      state,
      rulesResults,
      errors: errors as Ref<ShibieErrorTree<TRules>>,
      $shibie: $shibie,
    };
  }

  return useForm;
}
