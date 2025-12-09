import type {
  DeepMaybeRef,
  DeepPartial,
  DeepReactiveState,
  HaveAnyRequiredProps,
  LocalRegleBehaviourOptions,
  NoInferLegacy,
  PrimitiveTypes,
  RegleBehaviourOptions,
  RegleExternalSchemaErrorTree,
  RegleFieldIssue,
  RegleShortcutDefinition,
  ResolvedRegleBehaviourOptions,
} from '@regle/core';
import { useRootStorage } from '@regle/core';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { MaybeRef, Raw, Ref, UnwrapNestedRefs, WatchHandle } from 'vue';
import { computed, getCurrentScope, isRef, onScopeDispose, ref, unref, watch } from 'vue';
import { cloneDeep, getDotPath, isObject, merge, setObjectError } from '../../../shared';
import type { $InternalRegleResult, RegleSchema, RegleSchemaBehaviourOptions, RegleSingleFieldSchema } from '../types';

export type useRegleSchemaFnOptions<TAdditionalOptions extends Record<string, any>> = Omit<
  Partial<DeepMaybeRef<RegleBehaviourOptions>> & LocalRegleBehaviourOptions<Record<string, any>, {}, never>,
  'validationGroups' | 'lazy'
> &
  RegleSchemaBehaviourOptions &
  TAdditionalOptions;
export interface useRegleSchemaFn<
  TShortcuts extends RegleShortcutDefinition<any> = never,
  TAdditionalReturnProperties extends Record<string, any> = {},
  TAdditionalOptions extends Record<string, any> = {},
> {
  <TSchema extends StandardSchemaV1, TState extends StandardSchemaV1.InferInput<TSchema> | undefined>(
    ...params: [
      state: MaybeRef<DeepPartial<NoInferLegacy<TState>>> | DeepReactiveState<DeepPartial<NoInferLegacy<TState>>>,
      rulesFactory: MaybeRef<TSchema>,
      ...(HaveAnyRequiredProps<useRegleSchemaFnOptions<TAdditionalOptions>> extends true
        ? [options: useRegleSchemaFnOptions<TAdditionalOptions>]
        : [options?: useRegleSchemaFnOptions<TAdditionalOptions>]),
    ]
  ): NonNullable<TState> extends PrimitiveTypes
    ? RegleSingleFieldSchema<NonNullable<TState>, TSchema, TShortcuts, TAdditionalReturnProperties>
    : RegleSchema<UnwrapNestedRefs<NonNullable<TState>>, TSchema, TShortcuts, TAdditionalReturnProperties>;
}

export function createUseRegleSchemaComposable<TShortcuts extends RegleShortcutDefinition<any>>(
  options?: RegleBehaviourOptions,
  shortcuts?: RegleShortcutDefinition | undefined
): useRegleSchemaFn<TShortcuts> {
  const globalOptions: RegleBehaviourOptions = {
    autoDirty: options?.autoDirty,
    lazy: options?.lazy,
    rewardEarly: options?.rewardEarly,
    clearExternalErrorsOnChange: options?.clearExternalErrorsOnChange,
  };

  function useRegleSchema(
    state: MaybeRef<Record<string, any>> | DeepReactiveState<Record<string, any>> | PrimitiveTypes,
    schema: MaybeRef<StandardSchemaV1>,
    options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> &
      LocalRegleBehaviourOptions<Record<string, any>, {}, never> &
      RegleSchemaBehaviourOptions
  ): RegleSchema<Record<string, any>, StandardSchemaV1, RegleShortcutDefinition> {
    const computedSchema = computed(() => unref(schema));

    const { syncState = { onUpdate: false, onValidate: false }, ...defaultOptions } = options ?? {};

    const { onUpdate: syncOnUpdate = false, onValidate: syncOnValidate = false } = syncState;

    const resolvedOptions: ResolvedRegleBehaviourOptions = {
      ...globalOptions,
      ...defaultOptions,
    } as any;

    const isSingleField = computed(() => !isObject(processedState.value));

    const processedState = (isRef(state) ? state : ref(state)) as Ref<Record<string, any>>;

    const initialState = ref(
      isObject(processedState.value) ? { ...cloneDeep(processedState.value) } : cloneDeep(processedState.value)
    );

    const originalState = isObject(processedState.value)
      ? { ...cloneDeep(processedState.value) }
      : cloneDeep(processedState.value);

    const customErrors = ref<Raw<RegleExternalSchemaErrorTree> | RegleFieldIssue[]>({});
    const previousIssues = ref<readonly StandardSchemaV1.Issue[]>([]);

    let onValidate: (() => Promise<$InternalRegleResult>) | undefined = undefined;

    function getPropertiesFromIssue(issue: StandardSchemaV1.Issue) {
      let $path = getIssuePath(issue);
      const lastItem = issue.path?.[issue.path.length - 1];
      const lastItemKey = typeof lastItem === 'object' ? lastItem.key : lastItem;
      const isArray =
        (typeof lastItem === 'object' && 'value' in lastItem ? Array.isArray(lastItem.value) : false) ||
        ('type' in issue ? issue.type === 'array' : false) ||
        Array.isArray(getDotPath(processedState.value, $path));

      return { isArray, $path, lastItemKey, lastItem };
    }

    function getIssuePath(issue: StandardSchemaV1.Issue) {
      return issue.path?.map((item) => (typeof item === 'object' ? item.key : item.toString())).join('.') ?? '';
    }

    function getParentArrayPath(issue: StandardSchemaV1.Issue) {
      const lastItem = issue.path?.at(-1);
      const isNestedPath =
        typeof lastItem === 'object' ? typeof lastItem.key === 'string' : typeof lastItem === 'string';
      const index = issue.path?.findLastIndex((item) =>
        typeof item === 'object' ? typeof item.key === 'number' : typeof item === 'number'
      );
      if (!isNestedPath && index === -1) {
        return undefined;
      }
      if (index != null) {
        const truncatedPath = issue.path?.slice(0, index + 1);
        return { ...issue, path: truncatedPath };
      }
      return undefined;
    }

    // ---- Schema mode
    if (!computedSchema.value?.['~standard']) {
      throw new Error(`Only "standard-schema" compatible libraries are supported`);
    }

    function filterIssues(
      issues: readonly StandardSchemaV1.Issue[],
      isValidate = false
    ): readonly StandardSchemaV1.Issue[] {
      if (!isValidate && resolvedOptions.rewardEarly) {
        if (previousIssues.value.length) {
          let remappedPreviousIssues = previousIssues.value.reduce((acc, issue) => {
            if (
              '$currentArrayValue' in issue &&
              isObject(issue.$currentArrayValue) &&
              '$id' in issue.$currentArrayValue
            ) {
              let itemId = issue.$currentArrayValue.$id;
              const previousArrayIssue = issues.find((i: any) => i?.$currentArrayValue?.['$id'] === itemId);
              if (previousArrayIssue) {
                acc.push({ ...issue, path: previousArrayIssue?.path ?? [] });
              }
            } else {
              if (issues.some((i) => getIssuePath(i) === getIssuePath(issue))) {
                acc.push(issue);
              }
            }
            return acc;
          }, [] as StandardSchemaV1.Issue[]);

          return remappedPreviousIssues;
        }
        return [];
      }
      return issues;
    }

    function issuesToRegleErrors(result: StandardSchemaV1.Result<unknown>, isValidate = false) {
      const output = {};
      const mappedIssues = result.issues?.map((issue) => {
        const parentArrayPath = getParentArrayPath(issue);
        if (parentArrayPath) {
          const $currentArrayValue = getDotPath(processedState.value, getIssuePath(parentArrayPath));
          Object.defineProperty(issue, '$currentArrayValue', {
            value: $currentArrayValue,
            enumerable: true,
            configurable: true,
            writable: true,
          });
        }

        return issue;
      });

      const filteredIssues: readonly StandardSchemaV1.Issue[] = filterIssues(mappedIssues ?? [], isValidate);

      if (mappedIssues?.length) {
        const issues = filteredIssues.map((issue) => {
          let { isArray, $path, lastItemKey } = getPropertiesFromIssue(issue);

          return {
            ...issue,
            $path: $path,
            isArray,
            $property: lastItemKey,
            $rule: 'schema',
            $message: issue.message,
          };
        });

        issues.forEach(({ isArray, $path, ...issue }) => {
          setObjectError(output, $path, [issue], isArray);
        });

        previousIssues.value = issues;
      } else {
        previousIssues.value = [];
      }
      return output;
    }

    async function computeErrors(isValidate = false) {
      let result = computedSchema.value['~standard'].validate(processedState.value);
      if (result instanceof Promise) {
        result = await result;
      }

      if (isSingleField.value) {
        const filteredIssues = filterIssues(result.issues ?? [], isValidate);
        customErrors.value =
          filteredIssues?.map((issue) => ({
            $message: issue.message,
            $property: issue.path?.[issue.path.length - 1]?.toString() ?? '-',
            $rule: 'schema',
            ...issue,
          })) ?? [];
      } else {
        customErrors.value = issuesToRegleErrors(result, isValidate);
      }

      if (!result.issues) {
        if ((isValidate && syncOnValidate) || (!isValidate && syncOnUpdate)) {
          unWatchState?.();
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

    let unWatchState: WatchHandle;

    function defineWatchState() {
      unWatchState = watch(
        [processedState, computedSchema],
        () => {
          if (resolvedOptions.silent) {
            return;
          }
          computeErrors();
        },
        { deep: true }
      );
    }

    defineWatchState();
    computeErrors();

    onValidate = async () => {
      try {
        const result = await computeErrors(true);
        regle?.regle?.$touch();

        return {
          valid: !result.issues?.length,
          data: processedState.value,
          errors: regle?.regle?.$errors,
          issues: customErrors.value,
        };
      } catch (e) {
        return Promise.reject(e);
      }
    };

    if (getCurrentScope()) {
      onScopeDispose(() => {
        unWatchState();
      });
    }

    const regle = useRootStorage({
      scopeRules: computed(() => ({})),
      state: processedState,
      options: resolvedOptions,
      schemaErrors: customErrors,
      initialState,
      originalState,
      shortcuts,
      schemaMode: true,
      onValidate,
    });
    return {
      r$: regle.regle as any,
    };
  }

  return useRegleSchema as any;
}

/**
 * useRegle serves as the foundation for validation logic.
 *
 * It accepts the following inputs:
 *
 * @param state - This can be a plain object, a ref, a reactive object, or a structure containing nested refs.
 * @param schema - These should align with the structure of your state.
 * @param modifiers - customize regle behaviour
 *
 * ```ts
 * import { useRegleSchema } from '@regle/schemas';
 * import * as v from 'valibot';
 *
 * const { r$ } = useRegleSchema({ name: '' }, v.object({
 *   name: v.pipe(v.string(), v.minLength(3))
 * }))
 * ```
 * Docs: {@link https://reglejs.dev/integrations/schemas-libraries}
 */
export const useRegleSchema = createUseRegleSchemaComposable();
