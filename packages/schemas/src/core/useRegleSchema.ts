import type {
  DeepMaybeRef,
  DeepReactiveState,
  LocalRegleBehaviourOptions,
  RegleBehaviourOptions,
  RegleExternalErrorTree,
  ReglePartialRuleTree,
  RegleShortcutDefinition,
  ResolvedRegleBehaviourOptions,
  Unwrap,
  MismatchInfo,
  NoInferLegacy,
} from '@regle/core';
import { useRootStorage } from '@regle/core';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { PartialDeep } from 'type-fest';
import type { MaybeRef, Raw, Ref, UnwrapNestedRefs } from 'vue';
import { computed, isRef, reactive, ref, unref, watch } from 'vue';
import { cloneDeep, setObjectError } from '../../../shared';
import type { $InternalRegleResult, RegleSchema, RegleSchemaMode, RegleSchemaModeOptions } from '../types';
import { valibotObjectToRegle } from './converters/valibot/validators';
import { zodObjectToRegle } from './converters/zod/validators';

export type useRegleSchemaFn<TShortcuts extends RegleShortcutDefinition<any> = never> = <
  TState extends Record<string, any>,
  TSchema extends StandardSchemaV1<Record<string, any>> & TValid,
  TMode extends RegleSchemaMode = never,
  TValid = UnwrapNestedRefs<TState> extends PartialDeep<
    StandardSchemaV1.InferInput<TSchema>,
    { recurseIntoArrays: true }
  >
    ? {}
    : MismatchInfo<
        UnwrapNestedRefs<TState>,
        PartialDeep<StandardSchemaV1.InferInput<TSchema>, { recurseIntoArrays: true }>
      >,
>(
  state: MaybeRef<TState> | DeepReactiveState<TState>,
  schema: MaybeRef<TSchema>,
  options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> &
    LocalRegleBehaviourOptions<UnwrapNestedRefs<TState>, {}, never> &
    RegleSchemaModeOptions<TMode>
) => RegleSchema<
  UnwrapNestedRefs<TState>,
  StandardSchemaV1.InferInput<TSchema>,
  [TMode] extends [never] ? 'rules' : TMode,
  TShortcuts
>;

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

  function useRegleSchema<TState extends Record<string, any>, TSchema extends StandardSchemaV1 = StandardSchemaV1>(
    state: MaybeRef<TState> | DeepReactiveState<TState>,
    schema: MaybeRef<TSchema>,
    options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> &
      LocalRegleBehaviourOptions<Unwrap<TState>, {}, never> & { mode?: RegleSchemaMode }
  ): RegleSchema<TState, TSchema> {
    //
    const convertedRules = ref<ReglePartialRuleTree<any, any>>({});

    const computedSchema = computed(() => unref(schema));

    const { mode = 'rules', ...regleOptions } = options ?? {};

    const resolvedOptions: ResolvedRegleBehaviourOptions = {
      ...globalOptions,
      ...regleOptions,
    } as any;

    const processedState = (isRef(state) ? state : ref(state)) as Ref<Record<string, any>>;

    const initialState = ref({ ...cloneDeep(processedState.value) });

    const customErrors = ref<Raw<RegleExternalErrorTree>>({});

    let onValidate: (() => Promise<$InternalRegleResult>) | undefined = undefined;

    if (mode === 'rules') {
      watch(
        computedSchema,
        () => {
          if (computedSchema.value && typeof computedSchema.value === 'object') {
            if (computedSchema.value['~standard'].vendor === 'zod') {
              convertedRules.value = reactive(zodObjectToRegle(computedSchema.value as any, processedState));
            } else if (computedSchema.value['~standard'].vendor === 'valibot') {
              convertedRules.value = reactive(valibotObjectToRegle(computedSchema.value as any, processedState));
            }
          }
        },
        { deep: true, immediate: true, flush: 'post' }
      );
    } else {
      // ---- Schema mode
      const emptySkeleton = computedSchema.value['~standard'].validate(initialState.value);

      customErrors.value = issuesToRegleErrors(emptySkeleton as StandardSchemaV1.Result<unknown>);

      function issuesToRegleErrors(result: StandardSchemaV1.Result<unknown>) {
        const output = {};
        if (result.issues) {
          const errors = result.issues.map((issue) => {
            const path = issue.path?.map((item) => (typeof item === 'object' ? item.key : item)).join('.');
            const lastItem = issue.path?.[issue.path.length - 1];
            const isArray =
              (typeof lastItem === 'object' && 'value' in lastItem ? Array.isArray(lastItem.value) : false) ||
              ('type' in issue ? issue.type === 'array' : false);

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

      watch(
        [processedState, computedSchema],
        async () => {
          const result = await computedSchema.value['~standard'].validate(processedState.value);
          customErrors.value = issuesToRegleErrors(result);
        },
        { deep: true, immediate: true, flush: 'post' }
      );

      onValidate = async () => {
        try {
          const result = await computedSchema.value['~standard'].validate(processedState.value);
          customErrors.value = issuesToRegleErrors(result);

          return {
            result: !result.issues?.length,
            data: processedState.value,
          };
        } catch (e) {
          return Promise.reject(e);
        }
      };
    }

    const regle = useRootStorage({
      scopeRules: convertedRules as any,
      state: processedState,
      options: resolvedOptions,
      schemaErrors: customErrors,
      initialState,
      shortcuts,
      schemaMode: mode === 'schema',
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
