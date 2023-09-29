import { ComputedRef, Ref, computed, ref, watch } from 'vue';
import { isEmpty } from '../../utils';
import {
  AllRulesDeclarations,
  ShibiePartialValidationTree,
  ShibieRuleDefinition,
  Shibie,
} from '../../types';

export function useShibie(
  scopeRules: ComputedRef<ShibiePartialValidationTree<Record<string, any>>>,
  state: Ref<Record<string, any>>
) {
  // const rulesResults = ref<any>({});
  // const errors = ref<any>({});

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

  watch(
    [scopeRules, state],
    () => {
      Object.entries(scopeRules.value).map(([key, rules]) => {
        // if (isEmpty(rulesResults.value[key])) {
        //   rulesResults.value[key] = {};
        // }
        if (rules) {
          // errors.value[key] = [];
          Object.entries(rules).map(([ruleKey, rule]) => {
            const ruleDef = rule as ShibieRuleDefinition;
            const ruleResult = ruleDef.validator(state.value[key]);
            if (!ruleResult) {
              let message: string;
              if (typeof ruleDef.message === 'function') {
                message = ruleDef.message(state.value[key]);
              } else {
                message = ruleDef.message;
              }
              // errors.value[key].push(message);
            }
            // if (rulesResults.value[key][ruleKey] !== ruleResult) {
            //   rulesResults.value[key][ruleKey] = ruleResult;
            // }
          });
        }
      });
    },
    { deep: true, immediate: true }
  );

  return $shibie;
}
