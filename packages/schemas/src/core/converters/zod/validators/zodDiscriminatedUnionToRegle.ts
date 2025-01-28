import type { ReglePartialRuleTree } from '@regle/core';
import { required } from '@regle/rules';
import { effectScope, onScopeDispose, ref, toRef, watch, type Ref } from 'vue';
import type { z } from 'zod';
import { isObject } from '../../../../../../shared';
import { processZodTypeDef } from '../processZodTypeDef';

export function zodDiscriminatedUnionToRegle(
  schema: z.ZodDiscriminatedUnion<any, any>,
  state: Ref<unknown>,
  additionalIssues?: Ref<z.ZodIssue[] | undefined>
): { zodRule: Ref<ReglePartialRuleTree<any, any>> } {
  const scope = effectScope();

  const scopeState = scope.run(() => {
    const zodRule = ref<ReglePartialRuleTree<any, any>>({});

    watch(
      state,
      () => {
        if (isObject(state.value) && state.value[schema._def.discriminator]) {
          const selectedDiscriminant = schema._def.optionsMap.get(state.value[schema._def.discriminator]);
          if (selectedDiscriminant) {
            zodRule.value = Object.fromEntries(
              Object.entries(selectedDiscriminant._def.shape()).map(([key, shape]) => {
                if (typeof shape === 'object' && '_def' in shape) {
                  return [
                    key,
                    processZodTypeDef({
                      schema: shape,
                      state: toRef(isObject(state.value) ? state.value : {}),
                      additionalIssues,
                    }),
                  ];
                }
                return [key, {}];
              })
            );
          } else {
            zodRule.value = {};
          }
        } else {
          zodRule.value = {
            [schema._def.discriminator]: { required },
          };
        }
      },
      { deep: true, flush: 'pre', immediate: true }
    );

    onScopeDispose(() => {
      scope.stop();
    });

    return { zodRule };
  })!;

  return scopeState;
}
