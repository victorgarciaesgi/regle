import type { ReglePartialRuleTree } from '@regle/core';
import type * as v from 'valibot';
import { computed, effectScope, onScopeDispose, reactive, ref, toRef, watch, type Ref } from 'vue';
import { processValibotTypeDef } from '../processValibotTypeDef';
import { isIntersectSchema, isObjectSchema, isPipeSchema, isWrappedType } from '../guards';
import { isObject } from '../../../../../../shared';
import type { MaybeObjectAsync, MaybeSchemaAsync } from '../../../../types/valibot/valibot.schema.types';

export function getNestedValibotObjectSchema(
  schema: MaybeSchemaAsync<unknown> | v.SchemaWithPipe<any>
): v.ObjectSchema<v.ObjectEntries, undefined> | undefined {
  if (isIntersectSchema(schema)) {
    // reduce type bug ???
    const allEntries = (schema.options as any).reduce(
      (acc: v.ObjectEntries, value: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>) => {
        const nestedSchema = getNestedValibotObjectSchema(value);
        if (nestedSchema) {
          acc = {
            ...acc,
            ...nestedSchema.entries,
          };
        }
        return acc;
      },
      {} as v.ObjectEntries
    ) as v.ObjectEntries;
    return { entries: allEntries, type: 'object', kind: 'schema', async: false } as v.ObjectSchema<any, any>;
  } else if (isObjectSchema(schema)) {
    return schema;
  } else if (isWrappedType(schema)) {
    return getNestedValibotObjectSchema(schema.wrapped);
  } else {
    return undefined;
  }
}

// TODO simplify
export function valibotObjectToRegle({
  schema,
  state,
  rootAdditionalIssues,
}: {
  schema: MaybeObjectAsync<any> | v.SchemaWithPipe<any>;
  state: Ref<unknown>;
  rootAdditionalIssues?: Ref<v.BaseIssue<unknown>[] | undefined>;
}): { valibotRule: ReglePartialRuleTree<any, any> } {
  const nestedSchema = getNestedValibotObjectSchema(schema);

  const valibotRule = ref<ReglePartialRuleTree<any, any>>({});

  if (nestedSchema) {
    const hasEffects = isPipeSchema(nestedSchema)
      ? nestedSchema.pipe.some((pip) => ['validation'].includes(pip.kind))
      : false;

    if (hasEffects && !rootAdditionalIssues?.value?.length) {
      const scope = effectScope();
      scope.run(() => {
        const localAdditionalIssues = ref<v.BaseIssue<unknown>[]>([]);

        watch(
          state,
          async () => {
            if (!rootAdditionalIssues?.value?.length) {
              const errorResults = (await schema['~standard'].validate(state.value)) as v.SafeParseResult<
                v.BaseSchema<any, any, any>
              >;
              localAdditionalIssues.value =
                errorResults.issues?.filter((f) => ['check', 'raw_check'].includes(f.type)) ?? [];
            }
          },
          { deep: true, flush: 'sync', immediate: true }
        );

        valibotRule.value = Object.fromEntries(
          Object.entries(nestedSchema.entries).map(([key, shape]) => {
            if (typeof shape === 'object') {
              const childState = toRef(isObject(state.value) ? state.value : {}, key);
              const fieldIssues = computed(() => {
                return (rootAdditionalIssues?.value ?? localAdditionalIssues?.value)
                  ?.filter((f) => f.path?.[0].key === key)
                  .map((m) => {
                    // Remove first item of path
                    if (m.path) {
                      const [_, ...rest] = m.path;
                      return {
                        ...m,
                        path: rest as any,
                      };
                    }
                    return m;
                  });
              });
              return [
                key,
                processValibotTypeDef({
                  schema: shape,
                  state: childState,
                  additionalIssues: fieldIssues,
                }),
              ];
            }
            return [key, {}];
          })
        );

        onScopeDispose(() => {
          scope.stop();
        });
      })!;
    } else {
      valibotRule.value = Object.fromEntries(
        Object.entries(nestedSchema.entries).map(([key, shape]) => {
          if (typeof shape === 'object') {
            const childState = toRef(isObject(state.value) ? state.value : {}, key);
            const fieldIssues = computed(() => {
              return rootAdditionalIssues?.value
                ?.filter((f) => f.path?.[0].key === key)
                .map((m) => {
                  // Remove first item of path
                  if (m.path) {
                    const [_, ...rest] = m.path;
                    return {
                      ...m,
                      path: rest as any,
                    };
                  }
                  return m;
                });
            });
            return [
              key,
              processValibotTypeDef({
                schema: shape,
                state: childState,
                additionalIssues: fieldIssues,
              }),
            ];
          }
          return [key, {}];
        })
      );
    }
  }
  return reactive({ valibotRule });
}
