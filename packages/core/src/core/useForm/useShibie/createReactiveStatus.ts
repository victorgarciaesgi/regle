import { Ref, computed, reactive, ref, toRef, watch } from 'vue';
import { isEmpty } from '../../..';
import {
  CustomRulesDeclarationTree,
  PossibleShibieFieldStatus,
  ShibieFormPropertyType,
  ShibieRuleStatus,
} from '../../../types';
import { unwrapRuleParameters } from '../../createRule/unwrapRuleParameters';
import { isCollectionRulesDef, isNestedRulesDef } from '../shibie.guards';
import { ShibieStatus, ShibiePartialValidationTree } from '../../../types';

export function createReactiveNestedStatus(
  scopeRules: Ref<ShibiePartialValidationTree<Record<string, any>>>,
  state: Ref<Record<string, any>>,
  customRules: () => Partial<CustomRulesDeclarationTree>
): ShibieStatus<Record<string, any>, ShibiePartialValidationTree<Record<string, any>>> {
  const fields = reactive(
    Object.fromEntries(
      Object.entries(scopeRules.value)
        .map(([statePropKey, statePropRules]) => {
          if (statePropRules) {
            const stateRef = toRef(() => state.value[statePropKey]);
            const statePropRulesRef = toRef(() => statePropRules);
            return [
              statePropKey,
              createReactiveFieldStatus(stateRef, statePropRulesRef, customRules),
            ];
          }
          return [];
        })
        .filter(
          (rule): rule is [string, PossibleShibieFieldStatus] => !!rule.length && rule[1] != null
        )
    )
  );

  const $dirty = computed(() => {
    return Object.entries(fields).some(([key, statusOrField]) => {
      return statusOrField.$dirty;
    });
  });

  const $invalid = computed(() => {
    return Object.entries(fields).some(([key, statusOrField]) => {
      return statusOrField.$invalid;
    });
  });

  const $pending = computed(() => {
    return Object.entries(fields).some(([key, statusOrField]) => {
      return statusOrField.$pending;
    });
  });

  function $reset() {
    Object.entries(fields).forEach(([key, statusOrField]) => {
      statusOrField.$reset();
    });
  }

  function $touch() {
    Object.entries(fields).forEach(([key, statusOrField]) => {
      statusOrField.$touch();
    });
  }

  const $valid = computed(() => $invalid.value);

  return reactive({
    $dirty,
    $invalid,
    $valid,
    $pending,
    $value: state,
    fields,
    $reset,
    $touch,
  }) satisfies ShibieStatus<Record<string, any>, ShibiePartialValidationTree<Record<string, any>>>;
}

export function createReactiveFieldStatus(
  state: Ref<unknown>,
  rulesDef: Readonly<Ref<ShibieFormPropertyType>>,
  customRules: () => Partial<CustomRulesDeclarationTree>
): PossibleShibieFieldStatus | null {
  if (isCollectionRulesDef(rulesDef)) {
    // TODO collection
    return {} as any;
  } else if (isNestedRulesDef(state, rulesDef)) {
    return createReactiveNestedStatus(rulesDef, state as Ref<Record<string, any>>, customRules);
  } else if (rulesDef) {
    const customMessages = customRules();

    const rulesResults = computed(() => {
      return Object.fromEntries(
        Object.entries(rulesDef.value)
          .map(([ruleKey, rule]) => {
            let ruleResult: boolean = true;
            let $message: string = '';
            let $type: string;
            let $validator: (value: any, ...params: any[]) => boolean | Promise<boolean>;
            let $active: boolean;

            let params =
              typeof rule === 'function' ? [] : unwrapRuleParameters(rule?._params ?? []);

            const customMessageRule = customMessages[ruleKey]?.message;
            if (customMessageRule) {
              if (typeof customMessageRule === 'function') {
                $message = customMessageRule(state.value, ...params);
              } else {
                $message = customMessageRule;
              }
            }
            if (rule) {
              if (typeof rule === 'function') {
                const resultOrPromise = rule(state.value);
                // TODO Async rules
                // if (resultOrPromise instanceof Promise) {
                //   resultOrPromise.then(() => {
                //   });
                // } else {
                // }
                ruleResult = resultOrPromise;
                $type = ruleKey;
                $validator = rule;
                $active = true;
              } else {
                ruleResult = rule.validator(state.value, ...params);
                if (!(customMessageRule && !rule._patched)) {
                  if (typeof rule.message === 'function') {
                    $message = rule.message(state.value, ...params);
                  } else {
                    $message = rule.message;
                  }
                }

                if (typeof rule.active === 'function') {
                  $active = rule.active(state.value, ...params);
                } else {
                  $active = rule.active;
                }
                $type = rule.type === '__inline' ? ruleKey : rule.type;
                $validator = rule.validator;
              }

              if (isEmpty($message)) {
                $message = 'Error';
                console.warn(`No error message defined for ${ruleKey}`);
              }

              return [
                ruleKey,
                {
                  $active,
                  $message,
                  $type: $type,
                  $valid: ruleResult,
                  $validator,
                },
              ] satisfies [string, ShibieRuleStatus];
            }
            return [];
          })
          .filter((ruleDef): ruleDef is [string, ShibieRuleStatus] => !!ruleDef.length)
      ) satisfies Record<string, ShibieRuleStatus>;
    });

    const $dirty = ref(false);
    const $pending = ref(false);

    const $invalid = computed(() => {
      return Object.entries(rulesResults.value).some(([key, ruleResult]) => {
        return !ruleResult.$valid;
      });
    });

    function $reset() {
      $dirty.value = false;
    }

    function $touch() {
      $dirty.value = true;
    }

    const $valid = computed(() => !$invalid.value);

    watch(state, () => {
      if (!$dirty.value) {
        $dirty.value = true;
      }
    });

    return reactive({
      $dirty,
      $invalid,
      $pending,
      $valid,
      $reset,
      $touch,
      $value: state,
      $rules: rulesResults,
    });
  }

  return null;
}
