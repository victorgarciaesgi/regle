import type { RegleCollectionRuleDecl } from '@regle/core';
import { exactLength, maxLength, minLength } from '@regle/rules';
import type { z } from 'zod';
import { processZodTypeDef } from '../processZodTypeDef';
import { computed, effectScope, onScopeDispose, reactive, ref, watch, type Ref } from 'vue';

function getNestedZodArraySchema(
  schema: z.ZodType,
  effects: z.Effect<any>[] = []
): { nestedSchema: z.ZodArray<any> | z.ZodTuple<any> | undefined; nestedEffects?: z.Effect<any>[] } {
  if (schema._def && 'typeName' in schema._def) {
    if (schema._def.typeName === 'ZodEffects') {
      return getNestedZodArraySchema(
        (schema as z.ZodEffects<any>)._def.schema,
        effects.concat([(schema as z.ZodEffects<any>)._def.effect])
      );
    } else {
      return { nestedSchema: schema as z.ZodArray<any>, nestedEffects: effects };
    }
  }
  return { nestedSchema: undefined };
}

export function zodArrayToRegle(
  schema: z.ZodArray<any> | z.ZodTuple<any>,
  state: Ref<unknown>,
  rootAdditionalIssues?: Ref<z.ZodIssue[] | undefined>
): { zodRule: RegleCollectionRuleDecl } {
  const { nestedSchema, nestedEffects } = getNestedZodArraySchema(schema);

  const zodRule = ref<RegleCollectionRuleDecl<any, any>>({});
  if (nestedSchema) {
    const arrayValidators =
      nestedSchema._def.typeName === 'ZodArray'
        ? {
            ...(!!nestedSchema._def.minLength && { minLength: minLength(nestedSchema._def.minLength?.value) }),
            ...(!!nestedSchema._def.maxLength && { maxLength: maxLength(nestedSchema._def.maxLength?.value) }),
            ...(!!nestedSchema._def.exactLength && { exactLength: exactLength(nestedSchema._def.exactLength?.value) }),
          }
        : {};

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
            if (nestedSchema) {
              localAdditionalIssues.value = (rootAdditionalIssues?.value ?? []).concat(
                schema.safeParse(state.value).error?.issues.filter((f) => f.code === 'custom') ?? []
              );
            }
          },
          { deep: true, flush: 'pre', immediate: true }
        );

        if (nestedSchema) {
          const items = nestedSchema._def.typeName === 'ZodArray' ? nestedSchema._def.type : nestedSchema._def.items;

          zodRule.value = {
            $each: (_, index) => {
              const fieldIssues = computed(() => {
                return additionalIssues.value
                  ?.filter((f) => f.path[0] === index.toString())
                  .map((m) => {
                    const [first, ...rest] = m.path;
                    return {
                      ...m,
                      path: rest,
                    };
                  });
              });
              return processZodTypeDef({ schema: items, state, additionalIssues: fieldIssues });
            },
            ...arrayValidators,
          };
        } else {
          zodRule.value = {};
        }

        onScopeDispose(() => {
          scope.stop();
        });
      })!;
    } else {
      const items = nestedSchema._def.typeName === 'ZodArray' ? nestedSchema._def.type : nestedSchema._def.items;
      zodRule.value = {
        $each: processZodTypeDef({ schema: items, state, additionalIssues: rootAdditionalIssues }),
        ...arrayValidators,
      };
    }
  }
  return reactive({ zodRule });
}
