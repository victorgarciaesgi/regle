import {
  DeepMaybeRef,
  LocalRegleBehaviourOptions,
  Regle,
  RegleBehaviourOptions,
  ReglePartialValidationTree,
  RegleValidationTree,
  useRegle,
} from '@regle/core';
import { computed, MaybeRef, Ref, ref, unref, UnwrapRef, watch } from 'vue';
import { processZodTypeDef } from './parser/processZodTypeDef';
import {
  DeepReactiveState,
  PossibleDefTypes,
  ZodRegle,
  ZodToRegleErrorTree,
  toZod,
} from '../types';

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

  return useRegle(
    state,
    computed(() => rules.value),
    options
  ) as any;
}
