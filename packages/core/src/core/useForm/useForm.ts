import { ComputedRef, Ref, computed, effectScope, onScopeDispose, shallowRef, toRaw } from 'vue';
import {
  AllRulesDeclarations,
  Shibie,
  ShibieErrorTree,
  ShibiePartialValidationTree,
} from '../../types';
import { useShibie } from './useShibie';

export function createUseFormComposable<TCustomRules extends Partial<AllRulesDeclarations>>(
  customRules: () => TCustomRules
) {
  function useForm<
    TState extends Record<string, any>,
    TRules extends ShibiePartialValidationTree<TState, AllRulesDeclarations & TCustomRules>,
  >(state: Ref<TState>, rulesFactory: () => TRules) {
    let effectScopeConstructor = effectScope();

    let scopeRules = effectScopeConstructor.run(() => {
      return computed(rulesFactory);
    }) as ComputedRef<ShibiePartialValidationTree<TState, AllRulesDeclarations & TCustomRules>>;

    const initialState = shallowRef(structuredClone(toRaw(state.value)));

    const { $shibie, errors, rulesResults } = useShibie(scopeRules, state);

    onScopeDispose(() => {
      if (effectScopeConstructor.active) {
        effectScopeConstructor.stop();
      }
    });

    return {
      state,
      rulesResults,
      errors: errors as Ref<ShibieErrorTree<TRules>>,
      $shibie: $shibie as Ref<Shibie<TState, TRules>>,
    };
  }

  return useForm;
}
