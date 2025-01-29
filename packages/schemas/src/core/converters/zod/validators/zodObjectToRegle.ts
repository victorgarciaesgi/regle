import type { ReglePartialRuleTree } from '@regle/core';
import { computed, effectScope, onScopeDispose, reactive, ref, toRef, watch, type Ref } from 'vue';
import type { z } from 'zod';
import { processZodTypeDef } from '../processZodTypeDef';
import { isObject } from '../../../../../../shared';

function getNestedZodObjectSchema(
  schema: z.ZodType,
  effects: z.Effect<any>[] = []
): { nestedSchema: z.ZodObject<any> | undefined; nestedEffects?: z.Effect<any>[] } {
  if (schema._def && 'typeName' in schema._def) {
    if (schema._def.typeName === 'ZodEffects') {
      return getNestedZodObjectSchema(
        (schema as z.ZodEffects<any>)._def.schema,
        effects.concat([(schema as z.ZodEffects<any>)._def.effect])
      );
    } else if (schema._def.typeName === 'ZodIntersection') {
      const { nestedSchema: leftObject, nestedEffects: leftEffects = [] } = getNestedZodObjectSchema(
        (schema as z.ZodIntersection<any, any>)._def.left
      );
      const { nestedSchema: rightObject, nestedEffects: rightEffects = [] } = getNestedZodObjectSchema(
        (schema as z.ZodIntersection<any, any>)._def.right
      );
      if (leftObject && rightObject) {
        return getNestedZodObjectSchema(
          leftObject.merge(rightObject),
          effects.concat(leftEffects).concat(rightEffects)
        );
      }
      return { nestedSchema: undefined };
    } else {
      return { nestedSchema: schema as z.ZodObject<any>, nestedEffects: effects };
    }
  }
  return { nestedSchema: undefined };
}

export function zodObjectToRegle(
  schema: z.ZodObject<any> | z.ZodIntersection<any, any>,
  state: Ref<unknown>,
  rootAdditionalIssues?: Ref<z.ZodIssue[] | undefined>
): { zodRule: ReglePartialRuleTree<any, any> } {
  const { nestedSchema, nestedEffects } = getNestedZodObjectSchema(schema);

  const zodRule = ref<ReglePartialRuleTree<any, any>>({});

  if (nestedSchema) {
    if (nestedEffects?.length) {
      const scope = effectScope();
      scope.run(() => {
        const localAdditionalIssues = ref<z.ZodIssue[]>([]);
        const additionalIssues = computed(() => {
          return localAdditionalIssues.value.concat(rootAdditionalIssues?.value ?? []);
        });

        watch(
          state,
          () => {
            if (nestedSchema?._def?.typeName === 'ZodObject') {
              localAdditionalIssues.value = (rootAdditionalIssues?.value ?? []).concat(
                schema.safeParse(state.value).error?.issues.filter((f) => f.code === 'custom') ?? []
              );
            }
          },
          { deep: true, flush: 'sync', immediate: true }
        );

        if (nestedSchema?._def?.typeName === 'ZodObject') {
          zodRule.value = Object.fromEntries(
            Object.entries(nestedSchema._def.shape()).map(([key, shape]) => {
              if (shape && typeof shape === 'object' && '_def' in shape) {
                const childState = toRef(isObject(state.value) ? state.value : {}, key);
                const fieldIssues = computed(() => {
                  return additionalIssues.value
                    ?.filter((f) => f.path[0] === key)
                    .map((m) => {
                      // Remove first item of path
                      const [_, ...rest] = m.path;
                      return {
                        ...m,
                        path: rest,
                      };
                    });
                });

                return [
                  key,
                  processZodTypeDef({
                    schema: shape as z.ZodType,
                    state: childState,
                    additionalIssues: fieldIssues,
                  }),
                  [state],
                ];
              }
              return [key, {}];
            })
          );
        } else {
          zodRule.value = {};
        }

        onScopeDispose(() => {
          scope.stop();
        });
      })!;
    } else {
      zodRule.value = Object.fromEntries(
        Object.entries(nestedSchema._def.shape()).map(([key, shape]) => {
          if (shape && typeof shape === 'object' && '_def' in shape) {
            const childState = toRef(isObject(state.value) ? state.value : {}, key);
            return [
              key,
              processZodTypeDef({
                schema: shape as z.ZodType,
                state: childState,
                additionalIssues: rootAdditionalIssues,
              }),
            ];
          }
          return [key, {}];
        })
      );
    }
  }

  return reactive({ zodRule });
}
