import { ComputedRef, Ref, computed, effectScope, reactive, ref, toRef, watch } from 'vue';
import {
  CustomRulesDeclarationTree,
  Shibie,
  ShibieFieldStatus,
  ShibieFormPropertyType,
  ShibiePartialValidationTree,
  ShibieRuleStatus,
} from '../../../types';
import { isObject } from '../../../utils';
import { unwrapRuleParameters } from '../../createRule/unwrapRuleParameters';
import { isCollectionRulesDef, isNestedRulesDef } from '../shibie.guards';

function processRuleResult(
  state: Ref<unknown>,
  rulesDef: ShibieFormPropertyType,
  customRules: () => Partial<CustomRulesDeclarationTree>
): ShibieFieldStatus<any, any> | null {
  if (isCollectionRulesDef(rulesDef)) {
    // TODO collection
    return {} as any;
  } else if (isNestedRulesDef(state.value, rulesDef)) {
    // TODO nested
    return Object.fromEntries(
      Object.entries(rulesDef)
        .map(([statePropKey, statePropRules]) => {
          const stateValue = state.value;
          if (statePropRules && isObject(stateValue)) {
            const stateRef = toRef(() => stateValue[statePropKey]);
            return [statePropKey, processRuleResult(stateRef, statePropRules, customRules)];
          }
          return [];
        })
        .filter((rule) => !!rule.length)
    );
  } else if (rulesDef) {
    const customMessages = customRules();

    const rulesResults = computed(() => {
      return Object.fromEntries(
        Object.entries(rulesDef)
          .map(([ruleKey, rule]) => {
            let ruleResult: boolean = true;
            let $message: string | undefined = '';
            let $type: string;
            let $validator: (value: any, ...params: any[]) => boolean | Promise<boolean>;
            let $active: boolean;
            const customMessageRule = customMessages[ruleKey]?.message;
            if (customMessageRule) {
              let params =
                typeof rule === 'function' ? [] : unwrapRuleParameters(rule?._params ?? []);
              if (typeof customMessageRule === 'function') {
                $message = customMessageRule(state, ...params);
              } else {
                $message = customMessageRule;
              }
            }
            if (rule) {
              if (typeof rule === 'function') {
                const resultOrPromise = rule(state);
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
                ruleResult = rule.validator(state);
                if (!(customMessageRule && !rule._patched)) {
                  if (typeof rule.message === 'function') {
                    $message = rule.message(state);
                  } else {
                    $message = rule.message;
                  }
                }

                if (typeof rule.active === 'function') {
                  $active = rule.active(state);
                } else {
                  $active = rule.active;
                }
                $type = rule.type === '__inline' ? ruleKey : rule.type;
                $validator = rule.validator;
              }

              return [
                ruleKey,
                {
                  $active,
                  $message: $message ?? 'No defined error message',
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
      $valid: $valid,
      $reset,
      $touch,
      $value: state,
      $rules: rulesResults,
    });
  }

  return null;
}

function createInitialShibieStructure(
  scopeRules: ComputedRef<ShibiePartialValidationTree<Record<string, any>>>,
  state: Ref<Record<string, any>>,
  customRules: () => Partial<CustomRulesDeclarationTree>
) {
  const fields = reactive(
    Object.fromEntries(
      Object.entries(scopeRules.value)
        .map(([statePropKey, statePropRules]) => {
          if (statePropRules) {
            const stateRef = toRef(() => state.value[statePropKey]);
            return [
              statePropKey,
              processRuleResult(stateRef, statePropRules, customRules),
            ] satisfies [string, ShibieFieldStatus<any> | null];
          }
          return [];
        })
        .filter(
          (rule): rule is [string, ShibieFieldStatus<any>] => !!rule.length && rule[1] != null
        )
    )
  );

  return reactive({
    $dirty: false,
    $invalid: false,
    $valid: false,
    $pending: false,
    $value: state,
    fields,
    $reset: () => {},
    $touch: () => {},
  }) satisfies Shibie<Record<string, any>, ShibiePartialValidationTree<Record<string, any>>>;
}

export function useShibie(
  scopeRules: ComputedRef<ShibiePartialValidationTree<Record<string, any>, any>>,
  state: Ref<Record<string, any>>,
  customRules: () => CustomRulesDeclarationTree
) {
  const rulesResults = ref<any>({});
  const errors = ref<any>({});

  const $shibie = reactive<
    Shibie<Record<string, any>, ShibiePartialValidationTree<Record<string, any>>>
  >(createInitialShibieStructure(scopeRules, state, customRules));

  return { $shibie, rulesResults, errors };
}
