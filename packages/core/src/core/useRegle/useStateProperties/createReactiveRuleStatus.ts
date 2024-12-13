import type { ComputedRef, Ref, WatchStopHandle } from 'vue';
import { computed, effectScope, reactive, ref, watch } from 'vue';
import { isEmpty } from '../../../../../shared';
import type {
  $InternalInlineRuleDeclaration,
  $InternalRegleRuleDefinition,
  $InternalRegleRuleMetadataConsumer,
  $InternalRegleRuleStatus,
  CustomRulesDeclarationTree,
  InlineRuleDeclaration,
  RegleRuleDefinitionProcessor,
  RegleRuleMetadataDefinition,
} from '../../../types';
import { debounce } from '../../../utils';
import { unwrapRuleParameters } from '../../createRule/unwrapRuleParameters';
import type { RegleStorage } from '../../useStorage';
import { isFormRuleDefinition, isRuleDef } from '../guards';

interface CreateReactiveRuleStatusOptions {
  state: Ref<unknown>;
  ruleKey: string;
  rule: Ref<$InternalInlineRuleDeclaration | $InternalRegleRuleDefinition>;
  $dirty: Readonly<Ref<boolean>>;
  customMessages: CustomRulesDeclarationTree | undefined;
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
    $tooltip: ComputedRef<string | string[]>;
    $type: ComputedRef<string>;
    $validator: ComputedRef<
      RegleRuleDefinitionProcessor<any, any, RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>>
    >;
    $params: ComputedRef<any[]>;
    $path: ComputedRef<string>;
  };
  let scope = effectScope();
  let scopeState!: ScopeState;

  let $unwatchState: WatchStopHandle;

  const $haveAsync = ref(false);

  const { $pending, $valid, $metadata, $validating } = storage.trySetRuleStatusRef(`${path}.${ruleKey}`);

  function $watch() {
    scopeState = scope.run(() => {
      const $defaultMetadata = computed<$InternalRegleRuleMetadataConsumer>(() => ({
        $value: state.value,
        $invalid: !$valid.value,
        $pending: $pending.value,
        $dirty: $dirty.value,
        $params: $params.value,
        ...$metadata.value,
      }));

      const $active = computed<boolean>(() => {
        if (isFormRuleDefinition(rule)) {
          if (typeof rule.value.active === 'function') {
            return rule.value.active($defaultMetadata.value);
          } else {
            return !!rule.value.active;
          }
        } else {
          return true;
        }
      });

      function computeRuleProcessor(key: 'message' | 'tooltip'): string | string[] {
        let result: string | string[] = '';
        const customProcessor = customMessages ? customMessages[ruleKey]?.[key] : undefined;

        if (customProcessor) {
          if (typeof customProcessor === 'function') {
            result = customProcessor($defaultMetadata.value);
          } else {
            result = customProcessor;
          }
        }
        if (isFormRuleDefinition(rule)) {
          const patchedKey = `_${key}_patched` as const;
          if (!(customProcessor && !rule.value[patchedKey])) {
            if (typeof rule.value[key] === 'function') {
              result = rule.value[key]($defaultMetadata.value);
            } else {
              result = rule.value[key] ?? '';
            }
          }
        }
        return result;
      }

      const $message = computed<string | string[]>(() => {
        let message = computeRuleProcessor('message');

        if (isEmpty(message)) {
          message = 'This field is not valid';
          // if (typeof window !== 'undefined' && typeof process === 'undefined') {
          //   console.warn(`No error message defined for ${path}.${ruleKey}`);
          // }
        }

        return message;
      });

      const $tooltip = computed<string | string[]>(() => {
        return computeRuleProcessor('tooltip');
      });

      const $type = computed(() => {
        if (isFormRuleDefinition(rule) && rule.value.type) {
          return rule.value.type;
        } else {
          return ruleKey;
        }
      });

      const $validator = computed<RegleRuleDefinitionProcessor<any, any, boolean | Promise<boolean>>>(() => {
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
        $tooltip,
      } satisfies ScopeState;
    })!;

    $unwatchState = watch(scopeState.$params, $validate);
  }

  $watch();

  function updatePendingState() {
    $valid.value = true;
    if ($dirty.value) {
      $pending.value = true;
    }
  }

  async function computeAsyncResult() {
    const validator = scopeState.$validator.value;
    const resultOrPromise = validator(state.value, ...scopeState.$params.value);
    let ruleResult = false;
    let cachedValue = state.value;
    try {
      updatePendingState();
      let validatorResult;
      if (resultOrPromise instanceof Promise) {
        validatorResult = await resultOrPromise;
      } else {
        validatorResult = resultOrPromise;
      }

      if (state.value !== cachedValue) {
        return true;
      }
      if (typeof validatorResult === 'boolean') {
        ruleResult = validatorResult;
      } else {
        const { $valid, ...rest } = validatorResult;
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

  const $computeAsyncDebounce = debounce(computeAsyncResult, $debounce ?? 200);

  async function $validate(): Promise<boolean> {
    try {
      $validating.value = true;

      let ruleResult = false;

      if (isRuleDef(rule.value) && rule.value._async) {
        ruleResult = await $computeAsyncDebounce();
      } else {
        const validator = scopeState.$validator.value;
        const resultOrPromise = validator(state.value, ...scopeState.$params.value);
        if (resultOrPromise instanceof Promise) {
          console.warn(
            'You used a async validator function on a non-async rule, please use "async await" or the "withAsync" helper'
          );
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
      }
      $valid.value = ruleResult;
      return ruleResult;
    } catch (e) {
      return false;
    } finally {
      $validating.value = false;
    }
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
    $haveAsync,
    $validating,
    $validate,
    $unwatch,
    $watch,
    $reset,
  }) satisfies $InternalRegleRuleStatus;
}
