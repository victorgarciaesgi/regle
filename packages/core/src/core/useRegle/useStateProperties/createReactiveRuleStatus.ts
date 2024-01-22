import { ComputedRef, Ref, computed, effectScope, reactive, watch } from 'vue';
import {
  $InternalRegleRuleMetadataConsumer,
  $InternalRegleRuleStatus,
  CustomRulesDeclarationTree,
  InlineRuleDeclaration,
  InternalRuleType,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  RegleRuleMetadataDefinition,
  ResolvedRegleBehaviourOptions,
} from '../../../types';
import { isEmpty } from '../../../utils';
import { unwrapRuleParameters } from '../../createRule/unwrapRuleParameters';
import type { RegleStorage } from '../../useStorage';
import { isFormRuleDefinition } from '../guards';

interface CreateReactiveRuleStatusOptions {
  state: Ref<unknown>;
  ruleKey: string;
  rule: Ref<InlineRuleDeclaration | RegleRuleDefinition<any, any>>;
  $dirty: Ref<boolean>;
  customMessages?: Partial<CustomRulesDeclarationTree>;
  path: string;
  storage: RegleStorage;
  options: ResolvedRegleBehaviourOptions;
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
    $validator: ComputedRef<
      RegleRuleDefinitionProcessor<
        any,
        any,
        RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>
      >
    >;
    $params: ComputedRef<any[]>;
    $path: ComputedRef<string>;
  };
  let scope = effectScope();
  let scopeState!: ScopeState;

  const { $pending, $valid, $metadata } = storage.trySetRuleStatusRef(`${path}.${ruleKey}`);

  function $watch() {
    scopeState = scope.run(() => {
      const $defaultMetadata = computed<$InternalRegleRuleMetadataConsumer>(() => ({
        $invalid: !$valid.value,
        $params: $params.value,
        ...$metadata.value,
      }));
      const $active = computed<boolean>(() => {
        if (isFormRuleDefinition(rule)) {
          if (typeof rule.value.active === 'function') {
            return rule.value.active(state.value, $defaultMetadata.value);
          } else {
            return rule.value.active;
          }
        } else {
          return true;
        }
      });

      const $message = computed<string | string[]>(() => {
        let message: string | string[] | undefined;
        const customMessageRule = customMessages ? customMessages[ruleKey]?.message : undefined;

        if (customMessageRule) {
          if (typeof customMessageRule === 'function') {
            message = customMessageRule(state.value, $defaultMetadata.value);
          } else {
            message = customMessageRule;
          }
        }
        if (isFormRuleDefinition(rule)) {
          if (!(customMessageRule && !rule.value._patched)) {
            if (typeof rule.value.message === 'function') {
              message = rule.value.message(state.value, $defaultMetadata.value);
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
        if (isFormRuleDefinition(rule) && rule.value.type) {
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

          if (typeof promiseResult === 'boolean') {
            ruleResult = promiseResult;
          } else {
            const { $valid, ...rest } = promiseResult;
            ruleResult = $valid;
            $metadata.value = rest;
          }
        } catch (e) {
          ruleResult = false;
        } finally {
          $pending.value = false;
        }
      }
    } else {
      if (resultOrPromise != null) {
        if (typeof resultOrPromise === 'boolean') {
          ruleResult = resultOrPromise;
        } else {
          const { $valid, ...rest } = resultOrPromise;
          ruleResult = $valid;
          $metadata.value = rest;
        }
      }
    }
    $valid.value = ruleResult;
    if (options.$externalErrors) {
      // TODO
    }

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
