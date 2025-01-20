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
} from '@regle/core';
import { useRootStorage } from '@regle/core';
import type { MaybeRef, Ref } from 'vue';
import { computed, isRef, reactive, ref, unref, watch } from 'vue';
import { cloneDeep, setObjectError } from '../../../shared';
import type { ZodRegle, toZod } from '../types';
import { zodObjectToRegle } from './parser/validators';
import type { SafeParseReturnType } from 'zod';

export type useZodRegleFn<TShortcuts extends RegleShortcutDefinition<any> = never> = <
  TState extends Record<string, any>,
  TSchema extends toZod<Unwrap<TState>> = toZod<Unwrap<TState>>,
>(
  state: MaybeRef<TState> | DeepReactiveState<TState>,
  schema: MaybeRef<TSchema>,
  options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> &
    LocalRegleBehaviourOptions<Unwrap<TState>, {}, never> & { mode?: 'schema' | 'nested' }
) => ZodRegle<TState, TSchema, TShortcuts>;

export function createUseZodRegleComposable<TShortcuts extends RegleShortcutDefinition<any>>(
  options?: RegleBehaviourOptions,
  shortcuts?: RegleShortcutDefinition | undefined
): useZodRegleFn<TShortcuts> {
  const globalOptions: RegleBehaviourOptions = {
    autoDirty: options?.autoDirty,
    lazy: options?.lazy,
    rewardEarly: options?.rewardEarly,
    clearExternalErrorsOnChange: options?.clearExternalErrorsOnChange,
  };

  function useZodRegle<
    TState extends Record<string, any>,
    TZodSchema extends toZod<Unwrap<TState>> = toZod<Unwrap<TState>>,
  >(
    state: MaybeRef<TState> | DeepReactiveState<TState>,
    schema: MaybeRef<TZodSchema>,
    options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> &
      LocalRegleBehaviourOptions<Unwrap<TState>, {}, never> & { mode: 'schema' | 'nested' }
  ): ZodRegle<TState, TZodSchema> {
    //
    const rules = ref<ReglePartialRuleTree<any, any>>({});

    const computedSchema = computed(() => unref(schema));

    const { mode = 'nested', ...regleOptions } = options ?? {};

    const processedState = (isRef(state) ? state : ref(state)) as Ref<Record<string, any>>;

    const initialState = ref({ ...cloneDeep(processedState.value) });

    const customErrors = ref<RegleExternalErrorTree>({});

    if (mode === 'nested') {
      // Convert zod schema to regle rules
      watch(
        computedSchema,
        () => {
          if (computedSchema.value && typeof computedSchema.value === 'object') {
            rules.value = reactive(zodObjectToRegle(computedSchema.value, processedState));
          }
        },
        { deep: true, immediate: true }
      );
    } else {
      // Re-run whole schema on each input
      const emptySchemaSkeleton = computed(() => computedSchema.value.safeParse(processedState.value));

      customErrors.value = zodErrorsToRecord(emptySchemaSkeleton.value);

      function zodErrorsToRecord(result: SafeParseReturnType<any, any>) {
        const output = {};
        if (result.success === false) {
          const errors = result.error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
            type: 'type' in issue ? issue.type : 'string',
          }));

          errors.forEach((error) => {
            setObjectError(output, error.path, [error.message], error.type);
          });
        }
        return output;
      }

      watch(
        [processedState, computedSchema],
        async () => {
          const result = await computedSchema.value.safeParseAsync(processedState.value);
          customErrors.value = zodErrorsToRecord(result);
        },
        { deep: true, immediate: true, flush: 'post' }
      );
    }

    const resolvedOptions: ResolvedRegleBehaviourOptions = {
      ...globalOptions,
      ...regleOptions,
      externalErrors: customErrors,
    } as any;

    const regle = useRootStorage({
      scopeRules: rules as any,
      state: processedState,
      options: resolvedOptions,
      initialState,
      shortcuts,
    });

    return {
      r$: regle.regle as any,
    };
  }

  return useZodRegle as any;
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
 * import { useZodRegle } from '@regle/zod';
  import { z } from 'zod';

  const { r$ } = useZodRegle({ name: '' }, z.object({
    name: z.string().min(3)
  }))
 * ```
 * Docs: {@link https://reglejs.dev/integrations/zod#usage}  
 */
export const useZodRegle = createUseZodRegleComposable();
