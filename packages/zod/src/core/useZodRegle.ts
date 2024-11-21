import type {
  DeepMaybeRef,
  LocalRegleBehaviourOptions,
  RegleBehaviourOptions,
  RegleExternalErrorTree,
  ReglePartialValidationTree,
  Unwrap,
} from '@regle/core';
import { useRegle } from '@regle/core';
import type { MaybeRef } from 'vue';
import { computed, ref, unref, watch } from 'vue';
import type { DeepReactiveState, PossibleDefTypes, ZodRegle, toZod } from '../types';
import { processZodTypeDef } from './parser/processZodTypeDef';

export function useZodRegle<
  TState extends Record<string, any>,
  TExternal extends RegleExternalErrorTree<Unwrap<TState>>,
  TZodSchema extends toZod<Unwrap<TState>> = toZod<Unwrap<TState>>,
>(
  state: MaybeRef<TState> | DeepReactiveState<TState>,
  schema: MaybeRef<TZodSchema>,
  options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> &
    LocalRegleBehaviourOptions<Unwrap<TState>, {}, TExternal, never>
): ZodRegle<Unwrap<TState>, TZodSchema> {
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

  return useRegle(state, computed(() => rules.value) as any, options as any) as any;
}
