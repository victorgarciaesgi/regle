import { Ref, computed, reactive, ref, watch } from 'vue';
import { isEmpty } from '../../../utils';
import {
  CustomRulesDeclarationTree,
  InlineRuleDeclaration,
  InternalRuleType,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  RegleSoftRuleStatus,
} from '../../../types';
import { createReactiveParams, unwrapRuleParameters } from '../../createRule/unwrapRuleParameters';
import { isFormInline, isFormRuleDefinition } from '../guards';

export function createReactiveRuleStatus({
  $dirty,
  customMessages,
  rule,
  ruleKey,
  state,
  path,
}: {
  state: Ref<unknown>;
  ruleKey: string;
  rule: Ref<InlineRuleDeclaration<any>> | Ref<RegleRuleDefinition<any, any>>;
  $dirty: Ref<boolean>;
  customMessages: Partial<CustomRulesDeclarationTree>;
  path: string;
}) {
  const $pending = ref(false);
  const $valid = ref(true);

  const $active = computed<boolean>(() => {
    if (isFormInline(rule)) {
      return true;
    } else {
      if (typeof rule.value.active === 'function') {
        return rule.value.active(state.value, $params.value);
      } else {
        return rule.value.active;
      }
    }
  });

  const $message = computed<string>(() => {
    let message = '';
    const customMessageRule = customMessages[ruleKey]?.message;

    if (customMessageRule) {
      if (typeof customMessageRule === 'function') {
        message = customMessageRule(state.value, $params.value);
      } else {
        message = customMessageRule;
      }
    }
    if (isFormRuleDefinition(rule)) {
      if (!(customMessageRule && !rule.value._patched)) {
        if (typeof rule.value.message === 'function') {
          message = rule.value.message(state.value, $params.value);
        } else {
          message = rule.value.message;
        }
      }
    }

    if (isEmpty(message)) {
      message = 'Error';
      console.warn(`No error message defined for ${ruleKey}`);
    }

    return message;
  });

  const $type = computed(() => {
    if (isFormInline(rule)) {
      return ruleKey;
    } else {
      return Object.values(InternalRuleType).includes(rule.value.type) ? ruleKey : rule.value.type;
    }
  });

  const $validator = computed<RegleRuleDefinitionProcessor<any, any, boolean | Promise<boolean>>>(
    () => {
      if (isFormInline(rule)) {
        return rule.value;
      } else {
        return rule.value.validator;
      }
    }
  );

  const $params = computed<any[]>(() => {
    if (typeof rule.value === 'function') {
      return [];
    }
    return unwrapRuleParameters(rule.value._params ?? []);
  });

  watch([state, $params], $validate, { immediate: true, deep: true });

  async function $validate(): Promise<boolean> {
    const validator = $validator.value;
    let ruleResult = false;
    const resultOrPromise = validator(state.value, $params.value);

    if (resultOrPromise instanceof Promise) {
      if ($dirty.value) {
        try {
          $valid.value = true;
          $pending.value = true;
          const promiseResult = await resultOrPromise;

          ruleResult = promiseResult;
        } catch (e) {
          ruleResult = false;
        } finally {
          $pending.value = false;
        }
      }
    } else {
      ruleResult = resultOrPromise;
    }
    $valid.value = ruleResult;
    return ruleResult;
  }

  const $path = computed<string>(() => `${path}.${$type.value}`);

  return reactive({
    $message,
    $active,
    $pending,
    $type,
    $valid,
    $validator,
    $validate,
    $path,
    ...($params.value.length && { $params }),
  }) satisfies RegleSoftRuleStatus;
}
