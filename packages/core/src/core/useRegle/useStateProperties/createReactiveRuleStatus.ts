import { ComputedRef, Ref, computed, effectScope, reactive, ref, watch } from 'vue';
import {
  CustomRulesDeclarationTree,
  InlineRuleDeclaration,
  InternalRuleType,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  $InternalRegleRuleStatus,
  RegleBehaviourOptions,
  DeepMaybeRef,
} from '../../../types';
import { isEmpty } from '../../../utils';
import { unwrapRuleParameters } from '../../createRule/unwrapRuleParameters';
import { isFormRuleDefinition } from '../guards';
import type { RegleStorage } from '../../useStorage';
import { RequiredDeep } from 'type-fest';

interface CreateReactiveRuleStatusOptions {
  state: Ref<unknown>;
  ruleKey: string;
  rule: Ref<InlineRuleDeclaration | RegleRuleDefinition<any, any>>;
  $dirty: Ref<boolean>;
  customMessages?: Partial<CustomRulesDeclarationTree>;
  path: string;
  storage: RegleStorage;
  options: DeepMaybeRef<RequiredDeep<RegleBehaviourOptions>>;
}

export function createReactiveRuleStatus({
  $dirty,
  customMessages,
  rule,
  ruleKey,
  state,
  path,
  storage,
  options,
}: CreateReactiveRuleStatusOptions): $InternalRegleRuleStatus {
  type ScopeState = {
    $active: ComputedRef<boolean>;
    $message: ComputedRef<string>;
    $type: ComputedRef<string>;
    $validator: ComputedRef<RegleRuleDefinitionProcessor<any, any, boolean | Promise<boolean>>>;
    $params: ComputedRef<any[]>;
    $path: ComputedRef<string>;
  };
  let scope = effectScope();
  let scopeState!: ScopeState;

  const { $pending, $valid } = storage.trySetRuleStatusRef(`${path}.${ruleKey}`);

  function $watch() {
    scopeState = scope.run(() => {
      const $active = computed<boolean>(() => {
        if (isFormRuleDefinition(rule)) {
          if (typeof rule.value.active === 'function') {
            return rule.value.active(state.value, ...$params.value);
          } else {
            return rule.value.active;
          }
        } else {
          return true;
        }
      });

      const $message = computed<string>(() => {
        let message = '';
        const customMessageRule = customMessages ? customMessages[ruleKey]?.message : undefined;

        if (customMessageRule) {
          if (typeof customMessageRule === 'function') {
            message = customMessageRule(state.value, ...$params.value);
          } else {
            message = customMessageRule;
          }
        }
        if (isFormRuleDefinition(rule)) {
          if (!(customMessageRule && !rule.value._patched)) {
            if (typeof rule.value.message === 'function') {
              message = rule.value.message(state.value, ...$params.value);
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
        if (isFormRuleDefinition(rule)) {
          return Object.values(InternalRuleType).includes(rule.value.type)
            ? ruleKey
            : rule.value.type;
        } else {
          return ruleKey;
        }
      });

      const $validator = computed<
        RegleRuleDefinitionProcessor<any, any, boolean | Promise<boolean>>
      >(() => {
        if (isFormRuleDefinition(rule)) {
          return rule.value.validator;
        } else {
          return rule.value as InlineRuleDeclaration;
        }
      });

      const $params = computed<any[]>(() => {
        if (typeof rule.value === 'function') {
          return [];
        }
        return unwrapRuleParameters(rule.value._params ?? []);
      });

      const $path = computed<string>(() => `${path}.${$type.value}`);

      return {
        $active,
        $message,
        $type,
        $validator,
        $params,
        $path,
      };
    }) as ScopeState;

    // $validate();
  }

  $watch();

  const $unwatchState = watch(scopeState.$params, $validate, {
    deep: true,
  });

  async function $validate(): Promise<boolean> {
    const validator = scopeState.$validator.value;
    let ruleResult = false;
    const resultOrPromise = validator(state.value, ...scopeState.$params.value);
    if (resultOrPromise instanceof Promise) {
      if ($dirty.value && !$pending.value) {
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

  function $unwatch() {
    $unwatchState();
    scope.stop();
    scope = effectScope();
  }

  return reactive({
    ...scopeState,
    $pending,
    $valid,
    $validate,
    $unwatch,
    $watch,
  }) satisfies $InternalRegleRuleStatus;
}
