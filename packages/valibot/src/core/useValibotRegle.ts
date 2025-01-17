import type {
  DeepMaybeRef,
  DeepReactiveState,
  LocalRegleBehaviourOptions,
  RegleBehaviourOptions,
  ReglePartialRuleTree,
  RegleShortcutDefinition,
  ResolvedRegleBehaviourOptions,
  Unwrap,
} from '@regle/core';
import { useRootStorage } from '@regle/core';
import type { MaybeRef, Ref } from 'vue';
import { computed, isRef, reactive, ref, unref, watch } from 'vue';
import { cloneDeep } from '../../../shared';
import type { toValibot, ValibotRegle } from '../types';
import { valibotObjectToRegle } from './parser/validators';

export type useValibotRegleFn<TShortcuts extends RegleShortcutDefinition<any> = never> = <
  TState extends Record<string, any>,
  TSchema extends toValibot<Unwrap<TState>> = toValibot<Unwrap<TState>>,
>(
  state: MaybeRef<TState> | DeepReactiveState<TState>,
  schema: MaybeRef<TSchema>,
  options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> & LocalRegleBehaviourOptions<Unwrap<TState>, {}, never>
) => ValibotRegle<TState, TSchema, TShortcuts>;

export function createUseValibotRegleComposable<TShortcuts extends RegleShortcutDefinition<any>>(
  options?: RegleBehaviourOptions,
  shortcuts?: RegleShortcutDefinition | undefined
): useValibotRegleFn<TShortcuts> {
  const globalOptions: RegleBehaviourOptions = {
    autoDirty: options?.autoDirty,
    lazy: options?.lazy,
    rewardEarly: options?.rewardEarly,
    clearExternalErrorsOnChange: options?.clearExternalErrorsOnChange,
  };

  function useValibotRegle<
    TState extends Record<string, any>,
    TValibotSchema extends toValibot<Unwrap<TState>> = toValibot<Unwrap<TState>>,
  >(
    state: MaybeRef<TState> | DeepReactiveState<TState>,
    schema: MaybeRef<TValibotSchema>,
    options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> & LocalRegleBehaviourOptions<Unwrap<TState>, {}, never>
  ): ValibotRegle<TState, TValibotSchema> {
    //
    const rules = ref<ReglePartialRuleTree<any, any>>({});

    const scopeRules = computed(() => unref(schema));

    const resolvedOptions: ResolvedRegleBehaviourOptions = {
      ...globalOptions,
      ...options,
    } as any;

    const processedState = (isRef(state) ? state : ref(state)) as Ref<Record<string, any>>;

    const initialState = ref({ ...cloneDeep(processedState.value) });

    watch(
      scopeRules,
      () => {
        if (scopeRules.value && typeof scopeRules.value === 'object') {
          rules.value = reactive(valibotObjectToRegle(scopeRules.value, processedState));
        }
      },
      { deep: true, immediate: true }
    );

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

  return useValibotRegle as any;
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
 * import { useValibotRegle } from '@regle/valibot';
  import * as v from 'valibot';

  const { r$ } = useValibotRegle({ name: '' }, v.object({
    name: v.pipe(v.string(), v.minLength(3))
  }))
 * ```
 * Docs: {@link https://reglejs.dev/integrations/valibot#usage}  
 */
export const useValibotRegle = createUseValibotRegleComposable();
