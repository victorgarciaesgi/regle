import type {
  DeepMaybeRef,
  LocalRegleBehaviourOptions,
  RegleBehaviourOptions,
  ReglePartialRuleTree,
  RegleShortcutDefinition,
  ResolvedRegleBehaviourOptions,
  Unwrap,
} from '@regle/core';
import { useRegle, useRootStorage } from '@regle/core';
import type { MaybeRef, Ref } from 'vue';
import { computed, isRef, ref, unref, watch } from 'vue';
import type { DeepReactiveState, PossibleDefTypes, ZodRegle, toZod } from '../types';
import { processZodTypeDef } from './parser/processZodTypeDef';
import type { RequiredDeep } from 'type-fest';
import { cloneDeep } from '../../../shared';

export type useZodRegleFn<TShortcuts extends RegleShortcutDefinition<any> = never> = <
  TState extends Record<string, any>,
  TSchema extends toZod<Unwrap<TState>> = toZod<Unwrap<TState>>,
>(
  state: MaybeRef<TState> | DeepReactiveState<TState>,
  schema: MaybeRef<TSchema>,
  options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> & LocalRegleBehaviourOptions<Unwrap<TState>, {}, never>
) => ZodRegle<TState, TSchema, TShortcuts>;

export function createUseZodRegleComposable<TShortcuts extends RegleShortcutDefinition<any>>(
  options?: RegleBehaviourOptions,
  shortcuts?: RegleShortcutDefinition | undefined
): useZodRegleFn<TShortcuts> {
  const globalOptions: RequiredDeep<RegleBehaviourOptions> = {
    autoDirty: options?.autoDirty ?? true,
    lazy: options?.lazy ?? false,
    rewardEarly: options?.rewardEarly ?? false,
    clearExternalErrorsOnChange: options?.clearExternalErrorsOnChange ?? true,
  };

  function useZodRegle<
    TState extends Record<string, any>,
    TZodSchema extends toZod<Unwrap<TState>> = toZod<Unwrap<TState>>,
  >(
    state: MaybeRef<TState> | DeepReactiveState<TState>,
    schema: MaybeRef<TZodSchema>,
    options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> & LocalRegleBehaviourOptions<Unwrap<TState>, {}, never>
  ): ZodRegle<TState, TZodSchema> {
    //
    const rules = ref<ReglePartialRuleTree<any, any>>({});

    const scopeRules = computed(() => unref(schema));

    const resolvedOptions: ResolvedRegleBehaviourOptions = {
      ...globalOptions,
      ...options,
    } as any;

    function zodShapeToRegleRules() {
      rules.value = Object.fromEntries(
        Object.entries(scopeRules.value.shape).map(([key, shape]) => {
          if (typeof shape === 'object' && '_def' in shape) {
            const def = shape._def as PossibleDefTypes;
            return [key, processZodTypeDef(def, shape, processedState.value[key])];
          }
          return [key, {}];
        })
      );
      console.log(rules.value);
    }

    const processedState = (isRef(state) ? state : ref(state)) as Ref<Record<string, any>>;

    const initialState = { ...cloneDeep(processedState.value) };

    watch(
      [scopeRules, processedState],
      () => {
        zodShapeToRegleRules();
      },
      { deep: true }
    );
    zodShapeToRegleRules();

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
