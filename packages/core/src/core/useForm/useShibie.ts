import { ComputedRef, Ref, ref, watch } from 'vue';
import { Shibie, ShibiePartialValidationTree } from '../../types';
import { isEmpty } from '../../utils';

export function useShibie(
  scopeRules: ComputedRef<ShibiePartialValidationTree<Record<string, any>>>,
  state: Ref<Record<string, any>>
) {
  const rulesResults = ref<any>({});
  const errors = ref<any>({});

  const $shibie = ref<
    Shibie<Record<string, any>, ShibiePartialValidationTree<Record<string, any>>>
  >({
    $dirty: false,
    $invalid: false,
    $valid: true,
    $pending: false,
    $reset: function () {
      this.$dirty = false;
    },
    $touch: function () {
      this.$dirty = true;
    },
    fields: {},
    $value: {},
  });

  function processRules() {
    Object.entries(scopeRules.value).map(([key, rules]) => {
      if (isEmpty(rulesResults.value[key])) {
        rulesResults.value[key] = {};
      }
      if (rules) {
        errors.value[key] = [];
        Object.entries(rules).map(async ([ruleKey, ruleDef]) => {
          let ruleResult: boolean;
          let message: string | undefined = 'Error';
          if (ruleDef) {
            if (typeof ruleDef === 'function') {
              const resultOrPromise = ruleDef(state.value[key]);
              if (resultOrPromise instanceof Promise) {
                ruleResult = await resultOrPromise;
              } else {
                ruleResult = resultOrPromise;
              }
            } else {
              ruleResult = ruleDef.validator(state.value[key]);
              if (typeof ruleDef.message === 'function') {
                message = ruleDef.message(state.value[key]);
              } else {
                message = ruleDef.message;
              }
            }
            if (!ruleResult && message) {
              errors.value[key].push(message);
            }
            if (rulesResults.value[key][ruleKey] !== ruleResult) {
              rulesResults.value[key][ruleKey] = ruleResult;
            }
          }
        });
      }
    });
  }

  Object.entries(scopeRules.value).map(([key, rules]) => {
    if (rules) {
      Object.entries(rules).map(async ([ruleKey, ruleDef]) => {
        if (typeof ruleDef === 'function') {
          watch(ruleDef, processRules);
        } else if (ruleDef) {
          ruleDef._params?.forEach((param) => {
            if (typeof param === 'function') {
              watch(param, processRules);
            }
          });
        }
      });
    }
  });

  watch([scopeRules, state], processRules, { deep: true, immediate: true });

  return { $shibie, rulesResults, errors };
}
