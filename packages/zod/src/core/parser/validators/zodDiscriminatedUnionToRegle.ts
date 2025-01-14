import type { ReglePartialRuleTree } from '@regle/core';
import type { PossibleDefTypes } from '../../../types';
import type { z } from 'zod';
import { processZodTypeDef } from '../processZodTypeDef';
import { isObject } from '../../../../../shared';
import { required } from '@regle/rules';
import { computed, effectScope, toRef, type ComputedRef, type Ref } from 'vue';

export function zodDiscriminatedUnionToRegle(
  def: z.ZodDiscriminatedUnionDef<any>,
  state: Ref<unknown>
): ComputedRef<ReglePartialRuleTree<any, any>> {
  const scopeState = effectScope().run(() => {
    const zodRule = computed(() => {
      if (isObject(state.value) && state.value[def.discriminator]) {
        const selectedDiscriminant = def.optionsMap.get(state.value[def.discriminator]);
        if (selectedDiscriminant) {
          return Object.fromEntries(
            Object.entries(selectedDiscriminant._def.shape()).map(([key, shape]) => {
              if (typeof shape === 'object' && '_def' in shape) {
                const def = shape._def as PossibleDefTypes;

                return [key, processZodTypeDef(def, shape, toRef(isObject(state.value) ? state.value : {}, key))];
              }
              return [key, {}];
            })
          );
        }
        return {};
      }
      return {
        [def.discriminator]: { required },
      };
    });

    return zodRule;
  })!;

  return scopeState;
}
