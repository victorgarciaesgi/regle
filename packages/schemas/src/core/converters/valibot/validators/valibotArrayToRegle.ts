import type { RegleCollectionRuleDecl } from '@regle/core';
import { withMessage, withParams } from '@regle/rules';
import type * as v from 'valibot';
import { computed, effectScope, onScopeDispose, reactive, ref, watch, type Ref } from 'vue';
import { processValibotTypeDef } from '../processValibotTypeDef';
import type { MaybeArrayAsync } from '../../../../types/valibot/valibot.schema.types';
import { extractIssuesMessages } from '../../extractIssuesMessages';
import { isPipeSchema } from '../guards';
import { transformValibotAdapter } from './transformValibotAdapter';

type ArraySchema = v.ArraySchema<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>, undefined>;
export function valibotArrayToRegle(
  schema:
    | MaybeArrayAsync<any>
    | v.SchemaWithPipe<[ArraySchema, ...v.BaseValidation<unknown, unknown, v.BaseIssue<unknown>>[]]>,
  state: Ref<unknown>,
  rootAdditionalIssues?: Ref<v.BaseIssue<unknown>[] | undefined>
): { valibotRule: RegleCollectionRuleDecl } {
  let filteredSelfSchema: Record<string, any> = {};

  const valibotRule = ref<RegleCollectionRuleDecl<any, any>>({});

  if (isPipeSchema(schema)) {
    schema.pipe
      .filter((f) => f.kind === 'validation')
      .forEach((validation) => {
        filteredSelfSchema[validation.type] = withMessage((value) => {
          const result = validation['~run']({ value, typed: true }, {});
          return {
            $valid: !result.issues,
            $issues: result.issues,
          };
        }, extractIssuesMessages() as any);
      });
  }

  const hasEffects = isPipeSchema(schema) ? schema.pipe.some((pip) => ['validation'].includes(pip.kind)) : false;

  if (hasEffects && !rootAdditionalIssues?.value?.length) {
    const scope = effectScope();

    scope.run(() => {
      const localAdditionalIssues = ref<v.BaseIssue<unknown>[]>([]);

      // Local issues are already done by the parent refine if there is any
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
        { deep: true, immediate: true }
      );

      const selfAdditionalIssues = computed(() =>
        (rootAdditionalIssues?.value ?? localAdditionalIssues.value).filter((f) => !f.path?.length)
      );

      valibotRule.value = {
        $each: (_, index) => {
          const fieldIssues = computed(() => {
            return (rootAdditionalIssues?.value ?? localAdditionalIssues?.value)
              ?.filter((f) => f.path?.[0].key == index)
              .map((m) => {
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
          return processValibotTypeDef({ schema: schema.item, state, additionalIssues: fieldIssues });
        },
        selfValidator: withMessage(
          withParams(transformValibotAdapter(undefined, selfAdditionalIssues) as any, [state, selfAdditionalIssues]),
          extractIssuesMessages() as any
        ),
      };

      onScopeDispose(() => {
        scope.stop();
      });
    })!;
  } else {
    valibotRule.value = {
      $each: processValibotTypeDef({ schema: schema.item, state, additionalIssues: rootAdditionalIssues }),
      ...filteredSelfSchema,
    };
  }

  return reactive({ valibotRule });
}
