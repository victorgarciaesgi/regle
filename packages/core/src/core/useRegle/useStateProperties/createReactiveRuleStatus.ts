import type { ComputedRef, Ref } from 'vue';
import { computed, effectScope, reactive, toRaw, watch } from 'vue';
import type {
  $InternalRegleRuleMetadataConsumer,
  $InternalRegleRuleStatus,
  CustomRulesDeclarationTree,
  InlineRuleDeclaration,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  RegleRuleMetadataDefinition,
} from '../../../types';
import { InternalRuleType } from '../../../types';
import { debounce, isEmpty } from '../../../utils';
import { unwrapRuleParameters } from '../../createRule/unwrapRuleParameters';
import type { RegleStorage } from '../../useStorage';
import { isFormRuleDefinition } from '../guards';

interface CreateReactiveRuleStatusOptions {
  state: Ref<unknown>;
  ruleKey: string;
  rule: Ref<InlineRuleDeclaration<any, any[], any> | RegleRuleDefinition<any, any, any>>;
  $dirty: Ref<boolean>;
  customMessages?: Partial<CustomRulesDeclarationTree>;
  path: string;
  storage: RegleStorage;
  $debounce?: number;
}

export function createReactiveRuleStatus({
  $dirty,
  customMessages,
  rule,
  ruleKey,
  state,
  path,
  storage,
  $debounce,
}: CreateReactiveRuleStatusOptions): $InternalRegleRuleStatus {
  type ScopeState = {
    $active: ComputedRef<boolean>;
    $message: ComputedRef<string | string[]>;
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

  let $unwatchState: () => void;

  const { $pending, $valid, $metadata, $validating } = storage.trySetRuleStatusRef(
    `${path}.${ruleKey}`
  );

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
        let message: string | string[] = '';
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
          console.warn(`No error message defined for ${path}.${ruleKey}`);
        }

        return message;
      });

      const $type = computed(() => {
        if (isFormRuleDefinition(rule) && rule.value.type) {
          return rule.value.type;
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
          return rule.value as InlineRuleDeclaration<any, any[], any>;
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
      } satisfies ScopeState;
    })!;

    $unwatchState = watch(scopeState.$params, $validate, {
      deep: true,
    });
  }

  $watch();

  async function computeAsyncResult(promise: Promise<RegleRuleMetadataDefinition>) {
    let ruleResult = false;
    try {
      $valid.value = true;
      if ($dirty.value) {
        $pending.value = true;
      }
      const promiseResult = await promise;
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

    return ruleResult;
  }

  const $computeAsyncDebounce = debounce(computeAsyncResult, $debounce ?? 100);

  async function $validate(): Promise<boolean> {
    $validating.value = true;
    const validator = scopeState.$validator.value;
    let ruleResult = false;
    const resultOrPromise = validator(state.value, ...scopeState.$params.value);

    if (resultOrPromise instanceof Promise) {
      const promiseDebounce = $computeAsyncDebounce(resultOrPromise);
      ruleResult = await promiseDebounce;
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

    $validating.value = false;

    return ruleResult;
  }

  function $reset() {
    $valid.value = true;
    $metadata.value = {};
    $pending.value = false;
    $validating.value = false;

    $watch();
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
    $metadata,
    $validate,
    $unwatch,
    $watch,
    $reset,
  }) satisfies $InternalRegleRuleStatus;
}
