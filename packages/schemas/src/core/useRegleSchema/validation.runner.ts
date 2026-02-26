import type { RegleFieldIssue, RegleExternalSchemaErrorTree, ResolvedRegleBehaviourOptions } from '@regle/core';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { Raw, Ref, WatchHandle } from 'vue';
import { toValue, watch } from 'vue';
import { isObject, merge } from '../../../../shared';
import { issuesToRegleErrors, mapSingleFieldIssues, type SchemaIssueWithArrayValue } from './issues.mapper';

export function createSchemaValidationRunner({
  processedState,
  getSchema,
  isSingleField,
  customErrors,
  previousIssues,
  resolvedOptions,
  syncOnUpdate,
  syncOnValidate,
}: {
  processedState: Ref<Record<string, any>>;
  getSchema: () => StandardSchemaV1;
  isSingleField: Ref<boolean>;
  customErrors: Ref<Raw<RegleExternalSchemaErrorTree> | RegleFieldIssue[]>;
  previousIssues: Ref<readonly SchemaIssueWithArrayValue[]>;
  resolvedOptions: ResolvedRegleBehaviourOptions;
  syncOnUpdate: boolean;
  syncOnValidate: boolean;
}) {
  let unWatchState: WatchHandle | undefined;

  function defineWatchState() {
    stopWatching();

    unWatchState = watch(
      [processedState, getSchema],
      () => {
        if (resolvedOptions.silent) return;
        if (getSchema()['~standard'].vendor === 'regle') return;

        void computeErrors();
      },
      { deep: true }
    );
  }

  function stopWatching() {
    unWatchState?.();
    unWatchState = undefined;
  }

  async function computeErrors(isValidate = false) {
    let result = getSchema()['~standard'].validate(processedState.value);
    if (result instanceof Promise) {
      result = await result;
    }

    if (isSingleField.value) {
      customErrors.value = mapSingleFieldIssues(
        result.issues ?? [],
        previousIssues,
        toValue(resolvedOptions.rewardEarly),
        isValidate
      );
    } else {
      customErrors.value = issuesToRegleErrors({
        result,
        previousIssues,
        processedState,
        rewardEarly: toValue(resolvedOptions.rewardEarly),
        isValidate,
      });
    }

    if (!result.issues) {
      if ((isValidate && syncOnValidate) || (!isValidate && syncOnUpdate)) {
        stopWatching();
        if (isObject(processedState.value)) {
          processedState.value = merge(processedState.value, result.value as any);
        } else {
          processedState.value = result.value as any;
        }
        defineWatchState();
      }
    }

    return result;
  }

  return {
    computeErrors,
    defineWatchState,
    stopWatching,
  };
}
