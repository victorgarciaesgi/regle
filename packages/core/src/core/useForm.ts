import { ComputedRef, Ref, computed, effectScope, onScopeDispose, ref, watch } from 'vue';
import { ShibieRuleDefinition } from '..';
import { isEmpty } from '../utils';

export function createUseFormComposable() {
  function useForm(state: Ref<Record<string, any>>, factory: () => Record<string, any>) {
    let effectScopeConstructor = effectScope();

    let scopeRules = effectScopeConstructor.run(() => {
      return computed(factory);
    }) as ComputedRef<Record<string, any>>;

    const rulesResults = ref<any>({});
    const errors = ref<any>({});

    watch(
      [scopeRules, state],
      () => {
        Object.entries(scopeRules.value).map(([key, rules]) => {
          if (isEmpty(rulesResults.value[key])) {
            rulesResults.value[key] = {};
          }
          errors.value[key] = [];
          Object.entries(rules).map(([ruleKey, rule]) => {
            const ruleDef = rule as ShibieRuleDefinition<any>;
            const ruleResult = ruleDef.validator(state.value[key]);
            if (!ruleResult) {
              let message: string;
              if (typeof ruleDef.message === 'function') {
                message = ruleDef.message(state.value[key]);
              } else {
                message = ruleDef.message;
              }
              errors.value[key].push(message);
            }
            rulesResults.value[key][ruleKey] = ruleResult;
          });
        });
      },
      { deep: true, immediate: true }
    );

    onScopeDispose(() => {
      if (effectScopeConstructor.active) {
        effectScopeConstructor.stop();
      }
    });

    return { state, rulesResults, errors };
  }

  return useForm;
}

export const useForm = createUseFormComposable();
