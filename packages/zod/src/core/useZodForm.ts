import { Regle, ReglePartialValidationTree, RegleValidationTree, useRegle } from '@regle/core';
import { computed, MaybeRef, Ref, ref, unref, UnwrapRef, watch } from 'vue';
import { processZodTypeDef } from './parser/processZodTypeDef';
import { DeepReactiveState, PossibleDefTypes, toZod } from '../types';

export function useZodForm<
  TState extends Record<string, any>,
  TZodSchema extends toZod<UnwrapRef<TState>> = toZod<UnwrapRef<TState>>,
>(
  state: Ref<TState> | DeepReactiveState<TState>,
  schema: MaybeRef<TZodSchema>
): Regle<TState, RegleValidationTree<TState>> {
  const rules = ref<ReglePartialValidationTree<any, any>>({});

  const computedSchema = computed(() => unref(schema));

  function zodShapeToRegleRules() {
    console.log(computedSchema.value.shape);
    rules.value = Object.fromEntries(
      Object.entries(computedSchema.value.shape).map(([key, shape]) => {
        if (typeof shape === 'object' && '_def' in shape) {
          const def = shape._def as PossibleDefTypes;
          return [key, processZodTypeDef(def, shape)];
        }
        return [key, {}];
      })
    );
    console.log(rules.value);
  }

  watch(
    computedSchema,
    () => {
      zodShapeToRegleRules();
    },
    { deep: true }
  );
  zodShapeToRegleRules();

  return useRegle(
    state,
    computed(() => rules.value)
  ) as any;
}
