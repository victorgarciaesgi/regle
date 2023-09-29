import {
  ComputedRef,
  Ref,
  computed,
  effectScope,
  onScopeDispose,
  ref,
  shallowRef,
  toRaw,
  watch,
} from 'vue';
import {
  AllRulesDeclarations,
  Shibie,
  ShibiePartialValidationTree,
  ShibieRuleDefinition,
} from '../../types';
import { isEmpty } from '../../utils';
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

    const rulesResults = ref<any>({});
    const errors = ref<any>({});

    const initialState = shallowRef(structuredClone(toRaw(state.value)));

    const $shibie = useShibie(scopeRules, state);

    onScopeDispose(() => {
      if (effectScopeConstructor.active) {
        effectScopeConstructor.stop();
      }
    });

    return { state, rulesResults, errors, $shibie: $shibie as Ref<Shibie<TState, TRules>> };
  }

  return useForm;
}
