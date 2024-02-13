import {
  DeepMaybeRef,
  LocalRegleBehaviourOptions,
  RegleBehaviourOptions,
  ReglePartialValidationTree,
  useRegle,
} from '@regle/core';
import { MaybeRef, Ref, computed, ref, unref, watch } from 'vue';
import { DeepReactiveState, PossibleDefTypes, ZodRegle, toZod } from '../types';
import { processZodTypeDef } from './parser/processZodTypeDef';

export function useZodForm<
  TState extends Record<string, any>,
  TZodSchema extends toZod<TState> = toZod<TState>,
>(
  state: Ref<TState> | DeepReactiveState<TState>,
  schema: MaybeRef<TZodSchema>,
  options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> & LocalRegleBehaviourOptions<TState>
): ZodRegle<TState, TZodSchema> {
  const rules = ref<ReglePartialValidationTree<any, any>>({});

  const computedSchema = computed(() => unref(schema));

  function zodShapeToRegleRules() {
    rules.value = Object.fromEntries(
      Object.entries(computedSchema.value.shape).map(([key, shape]) => {
        if (typeof shape === 'object' && '_def' in shape) {
          const def = shape._def as PossibleDefTypes;
          return [key, processZodTypeDef(def, shape)];
        }
        return [key, {}];
      })
    );
  }

  watch(
    computedSchema,
    () => {
      zodShapeToRegleRules();
    },
    { deep: true }
  );
  zodShapeToRegleRules();

  return useRegle(state, computed(() => rules.value) as any, options) as any;
}
