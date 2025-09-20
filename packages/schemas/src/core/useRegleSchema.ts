import type {
  DeepMaybeRef,
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
import type { PartialDeep } from 'type-fest';
import type { MaybeRef, Raw, Ref, UnwrapNestedRefs, WatchHandle } from 'vue';
import { computed, isRef, ref, unref, watch } from 'vue';
import { cloneDeep, getDotPath, isObject, merge, setObjectError } from '../../../shared';
import type { $InternalRegleResult, RegleSchema, RegleSchemaBehaviourOptions, RegleSingleFieldSchema } from '../types';

export type useRegleSchemaFnOptions<TAdditionalOptions extends Record<string, any>> = Omit<
  Partial<DeepMaybeRef<RegleBehaviourOptions>> & LocalRegleBehaviourOptions<Record<string, any>, {}, never>,
  'validationGroups' | 'lazy' | 'rewardEarly' | 'silent'
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
      state:
        | MaybeRef<PartialDeep<NoInferLegacy<TState>, { recurseIntoArrays: true }>>
        | DeepReactiveState<PartialDeep<NoInferLegacy<TState>, { recurseIntoArrays: true }>>,
      rulesFactory: MaybeRef<TSchema>,
      ...(HaveAnyRequiredProps<useRegleSchemaFnOptions<TAdditionalOptions>> extends true
        ? [options: useRegleSchemaFnOptions<TAdditionalOptions>]
        : [options?: useRegleSchemaFnOptions<TAdditionalOptions>]),
    ]
  ): NonNullable<TState> extends PrimitiveTypes
    ? RegleSingleFieldSchema<
        NonNullable<TState>,
        StandardSchemaV1.InferInput<TSchema>,
        TShortcuts,
        TAdditionalReturnProperties
      >
    : RegleSchema<
        UnwrapNestedRefs<NonNullable<TState>>,
        UnwrapNestedRefs<NonNullable<StandardSchemaV1.InferInput<TSchema>>>,
        TShortcuts,
        TAdditionalReturnProperties
      >;
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
  ): RegleSchema<Record<string, any>, StandardSchemaV1> {
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

    let onValidate: (() => Promise<$InternalRegleResult>) | undefined = undefined;

    // ---- Schema mode
    if (!computedSchema.value?.['~standard']) {
      throw new Error(`Only "standard-schema" compatible libraries are supported`);
    }

    function issuesToRegleErrors(result: StandardSchemaV1.Result<unknown>) {
      const output = {};
      if (result.issues) {
        const issues = result.issues.map((issue) => {
          let $path =
            issue.path?.map((item) => (typeof item === 'object' ? item.key : item.toString())).join('.') ?? '';
          const lastItem = issue.path?.[issue.path.length - 1];
          const lastItemKey = typeof lastItem === 'object' ? lastItem.key : lastItem;
          const isArray =
            (typeof lastItem === 'object' && 'value' in lastItem ? Array.isArray(lastItem.value) : false) ||
            ('type' in issue ? issue.type === 'array' : false) ||
            Array.isArray(getDotPath(processedState.value, $path));

          const isPrimitivesArray = !isArray && typeof lastItemKey === 'number';

          if (isPrimitivesArray) {
            $path =
              issue.path
                ?.slice(0, issue.path.length - 1)
                ?.map((item) => (typeof item === 'object' ? item.key : item.toString()))
                .join('.') ?? '';
          }

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
      }
      return output;
    }

    async function computeErrors(isValidate = false) {
      let result = computedSchema.value['~standard'].validate(processedState.value);
      if (result instanceof Promise) {
        result = await result;
      }

      if (isSingleField.value) {
        customErrors.value =
          result.issues?.map((issue) => ({
            $message: issue.message,
            $property: issue.path?.[issue.path.length - 1]?.toString() ?? '-',
            $rule: 'schema',
            ...issue,
          })) ?? [];
      } else {
        customErrors.value = issuesToRegleErrors(result);
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
      unWatchState = watch([processedState, computedSchema], () => computeErrors(), { deep: true });
    }

    defineWatchState();
    computeErrors();

    onValidate = async () => {
      try {
        const result = await computeErrors(true);

        return {
          valid: !result.issues?.length,
          data: processedState.value,
          errors: {},
          issues: {},
        };
      } catch (e) {
        return Promise.reject(e);
      }
    };

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
