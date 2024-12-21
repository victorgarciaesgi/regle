import type {
  DeepMaybeRef,
  LocalRegleBehaviourOptions,
  RegleBehaviourOptions,
  ReglePartialRuleTree,
  Unwrap,
} from '@regle/core';
import { useRegle } from '@regle/core';
import type { MaybeRef } from 'vue';
import { computed, ref, unref, watch } from 'vue';
import type { DeepReactiveState, toValibot, ValibotRegle } from '../types';
import type * as v from 'valibot';
import { processValibotTypeDef } from './parser/processValibotTypeDef';

export function useValibotRegle<
  TState extends Record<string, any>,
  TValibotSchema extends toValibot<Unwrap<TState>> = toValibot<Unwrap<TState>>,
>(
  state: MaybeRef<TState> | DeepReactiveState<TState>,
  schema: MaybeRef<TValibotSchema>,
  options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> & LocalRegleBehaviourOptions<Unwrap<TState>, {}, never>
): ValibotRegle<TState, TValibotSchema> {
  const rules = ref<ReglePartialRuleTree<any, any>>({});

  const computedSchema = computed(() => unref(schema));

  function valibotShapeToRegleRules() {
    rules.value = Object.fromEntries(
      Object.entries(computedSchema.value.entries).map(
        ([key, schema]: [string, v.BaseSchema<unknown, unknown, any>]) => {
          if (typeof schema === 'object') {
            return [key, processValibotTypeDef(schema)];
          }
          return [key, {}];
        }
      )
    );
  }

  watch(
    computedSchema,
    () => {
      valibotShapeToRegleRules();
    },
    { deep: true }
  );
  valibotShapeToRegleRules();

  return useRegle(state, computed(() => rules.value) as any, options as any) as any;
}
