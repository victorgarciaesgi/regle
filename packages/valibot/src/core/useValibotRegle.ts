import type {
  DeepMaybeRef,
  LocalRegleBehaviourOptions,
  RegleBehaviourOptions,
  ReglePartialRuleTree,
  RegleShortcutDefinition,
  ResolvedRegleBehaviourOptions,
  Unwrap,
} from '@regle/core';
import { useRootStorage } from '@regle/core';
import type { RequiredDeep } from 'type-fest';
import type * as v from 'valibot';
import type { MaybeRef, Ref } from 'vue';
import { computed, isRef, ref, unref, watch } from 'vue';
import { cloneDeep } from '../../../shared';
import type { DeepReactiveState, toValibot, ValibotRegle } from '../types';
import { processValibotTypeDef } from './parser/processValibotTypeDef';

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
  const globalOptions: RequiredDeep<RegleBehaviourOptions> = {
    autoDirty: options?.autoDirty ?? true,
    lazy: options?.lazy ?? false,
    rewardEarly: options?.rewardEarly ?? false,
    clearExternalErrorsOnChange: options?.clearExternalErrorsOnChange ?? true,
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

    function valibotShapeToRegleRules() {
      rules.value = Object.fromEntries(
        Object.entries(scopeRules.value.entries).map(([key, schema]: [string, v.BaseSchema<unknown, unknown, any>]) => {
          if (typeof schema === 'object') {
            return [key, processValibotTypeDef(schema)];
          }
          return [key, {}];
        })
      );
    }

    const processedState = (isRef(state) ? state : ref(state)) as Ref<Record<string, any>>;

    const initialState = { ...cloneDeep(processedState.value) };

    watch(
      scopeRules,
      () => {
        valibotShapeToRegleRules();
      },
      { deep: true }
    );
    valibotShapeToRegleRules();

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

export const useValibotRegle = createUseValibotRegleComposable();
