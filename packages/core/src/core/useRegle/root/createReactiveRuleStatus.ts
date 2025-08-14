import type { ComputedRef, Ref, WatchStopHandle } from 'vue';
import { computed, effectScope, reactive, ref, watch } from 'vue';
import { debounce, isEmpty } from '../../../../../shared';
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
import { unwrapRuleParameters } from '../../createRule/unwrapRuleParameters';
import type { RegleStorage } from '../../useStorage';
import { isFormRuleDefinition, isRuleDef } from '../guards';

interface CreateReactiveRuleStatusOptions {
  state: Ref<unknown>;
  ruleKey: string;
  rule: Ref<$InternalInlineRuleDeclaration | $InternalRegleRuleDefinition>;
  modifiers: {
    $rewardEarly: ComputedRef<boolean | undefined>;
    $silent: ComputedRef<boolean | undefined>;
  };
  customMessages: CustomRulesDeclarationTree | undefined;
  path: string;
  cachePath: string;
  storage: RegleStorage;
  $debounce?: number;
}

export function createReactiveRuleStatus({
  customMessages,
  rule,
  ruleKey,
  state,
  path,
  cachePath,
  storage,
  $debounce,
  modifiers,
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
    $fieldDirty: Ref<boolean>;
    $fieldError: Ref<boolean>;
    $fieldInvalid: Ref<boolean>;
    $fieldPending: Ref<boolean>;
    $fieldCorrect: Ref<boolean>;
  };
  let scope = effectScope();
  let scopeState: ScopeState = {} as any;

  let $unwatchState: WatchStopHandle;

  const $haveAsync = computed(() => {
    return isRuleDef(rule.value) && rule.value._async;
  });
  const $maybePending = ref(false);

  const { $pending, $valid, $metadata, $validating } = storage.trySetRuleStatusRef(`${cachePath}.${ruleKey}`);

  function $watch() {
    scope = effectScope();
    scopeState = scope.run(() => {
      // Temp fix for Vue 3.4, to avoid loops
      const $fieldDirty = ref(false);

      // Temp fix for Vue 3.4, to avoid loops
      const $fieldError = ref(false);

      // Temp fix for Vue 3.4, to avoid loops
      const $fieldInvalid = ref(true);

      // Temp fix for Vue 3.4, to avoid loops
      const $fieldPending = ref(false);

      // Temp fix for Vue 3.4, to avoid loops
      // Represent the parent field $valid status
      const $fieldCorrect = ref(false);

      const $defaultMetadata = computed<$InternalRegleRuleMetadataConsumer>(() => ({
        $value: state.value,
        $error: $fieldError.value,
        $dirty: $fieldDirty.value,
        $pending: $fieldPending.value,
        $correct: $fieldCorrect.value,
        $invalid: $fieldInvalid.value,
        $rule: {
          $valid: $valid.value,
          $invalid: !$valid.value,
          $pending: $pending.value,
        },
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
        $fieldCorrect,
        $fieldError,
        $fieldDirty,
        $fieldPending,
        $fieldInvalid,
      } satisfies ScopeState;
    })!;

    $unwatchState = watch(scopeState?.$params, () => {
      if (!modifiers.$silent.value || (modifiers.$rewardEarly.value && scopeState.$fieldError.value)) {
        $parse();
      }
    });
  }

  $watch();

  function updatePendingState() {
    $valid.value = true;
    if (scopeState.$fieldDirty.value) {
      $pending.value = true;
    }
  }

  async function computeAsyncResult(): Promise<boolean> {
    let ruleResult = false;
    try {
      const validator = scopeState.$validator.value;
      if (typeof validator !== 'function') {
        console.error(`${path}: Incorrect rule format, it needs to be either a function or created with "createRule".`);
        return false;
      }
      const resultOrPromise = validator(state.value, ...scopeState.$params.value);
      let cachedValue = state.value;
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

  async function $parse(): Promise<boolean> {
    try {
      $validating.value = true;

      let ruleResult = false;
      $maybePending.value = true;

      if (isRuleDef(rule.value) && rule.value._async) {
        ruleResult = await computeAsyncResult();
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
      $maybePending.value = false;
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
    $maybePending,
    $validating,
    $parse,
    $unwatch,
    $watch,
    $reset,
  }) satisfies $InternalRegleRuleStatus;
}
