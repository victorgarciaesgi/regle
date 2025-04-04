import type {
  DeepMaybeRef,
  DeepReactiveState,
  LocalRegleBehaviourOptions,
  MaybeInput,
  PrimitiveTypes,
  RegleBehaviourOptions,
  RegleExternalErrorTree,
  ReglePartialRuleTree,
  RegleShortcutDefinition,
  ResolvedRegleBehaviourOptions,
} from '@regle/core';
import { useRootStorage } from '@regle/core';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { MaybeRef, Raw, Ref, UnwrapNestedRefs } from 'vue';
import { computed, isRef, ref, unref, watch } from 'vue';
import { cloneDeep, getDotPath, isObject, setObjectError } from '../../../shared';
import type { $InternalRegleResult, RegleSchema, RegleSchemaMode, RegleSingleFieldSchema } from '../types';
import type { PartialDeep } from 'type-fest';

export interface useRegleSchemaFn<TShortcuts extends RegleShortcutDefinition<any> = never> {
  <TSchema extends StandardSchemaV1, TState extends StandardSchemaV1.InferInput<TSchema> | undefined>(
    state:
      | MaybeRef<PartialDeep<TState, { recurseIntoArrays: true }>>
      | DeepReactiveState<PartialDeep<TState, { recurseIntoArrays: true }>>,
    rulesFactory: MaybeRef<TSchema>
  ): NonNullable<TState> extends PrimitiveTypes
    ? RegleSingleFieldSchema<NonNullable<TState>, StandardSchemaV1.InferInput<TSchema>, TShortcuts>
    : RegleSchema<
        UnwrapNestedRefs<NonNullable<TState>>,
        UnwrapNestedRefs<NonNullable<StandardSchemaV1.InferInput<TSchema>>>,
        TShortcuts
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
      LocalRegleBehaviourOptions<Record<string, any>, {}, never> & { mode?: RegleSchemaMode }
  ): RegleSchema<Record<string, any>, StandardSchemaV1> {
    const convertedRules = ref<ReglePartialRuleTree<any, any>>({});

    const computedSchema = computed(() => unref(schema));

    const resolvedOptions: ResolvedRegleBehaviourOptions = {
      ...globalOptions,
      ...options,
    } as any;

    const isSingleField = computed(() => !isObject(processedState.value));

    const processedState = (isRef(state) ? state : ref(state)) as Ref<Record<string, any>>;

    const initialState = ref(
      isObject(processedState.value) ? { ...cloneDeep(processedState.value) } : cloneDeep(processedState.value)
    );
    const customErrors = ref<Raw<RegleExternalErrorTree> | string[]>({});

    let onValidate: (() => Promise<$InternalRegleResult>) | undefined = undefined;

    // ---- Schema mode
    if (!computedSchema.value?.['~standard']) {
      throw new Error(`Only "standard-schema" compatible libraries are supported`);
    }

    function issuesToRegleErrors(result: StandardSchemaV1.Result<unknown>) {
      const output = {};
      if (result.issues) {
        const errors = result.issues.map((issue) => {
          const path =
            issue.path?.map((item) => (typeof item === 'object' ? item.key : item.toString())).join('.') ?? '';
          const lastItem = issue.path?.[issue.path.length - 1];
          const isArray =
            (typeof lastItem === 'object' && 'value' in lastItem ? Array.isArray(lastItem.value) : false) ||
            ('type' in issue ? issue.type === 'array' : false) ||
            Array.isArray(getDotPath(processedState.value, path));

          return {
            path: path,
            message: issue.message,
            isArray,
          };
        });

        errors.forEach((error) => {
          setObjectError(output, error.path, [error.message], error.isArray);
        });
      }
      return output;
    }

    async function computeErrors() {
      let result = computedSchema.value['~standard'].validate(processedState.value);
      if (result instanceof Promise) {
        result = await result;
      }
      if (isSingleField.value) {
        customErrors.value = result.issues?.map((issue) => issue.message) ?? [];
      } else {
        customErrors.value = issuesToRegleErrors(result);
      }
      return result;
    }

    watch([processedState, computedSchema], computeErrors, { deep: true, immediate: true });

    onValidate = async () => {
      try {
        const result = await computeErrors();

        return {
          valid: !result.issues?.length,
          data: processedState.value,
        };
      } catch (e) {
        return Promise.reject(e);
      }
    };

    const regle = useRootStorage({
      scopeRules: convertedRules as any,
      state: processedState,
      options: resolvedOptions,
      schemaErrors: customErrors,
      initialState,
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
  import * as v from 'valibot';

  const { r$ } = useRegleSchema({ name: '' }, v.object({
    name: v.pipe(v.string(), v.minLength(3))
  }))
 * ```
 * Docs: {@link https://reglejs.dev/integrations/valibot#usage}
 */
export const useRegleSchema = createUseRegleSchemaComposable();
