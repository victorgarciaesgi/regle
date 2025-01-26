import type { RegleCollectionRuleDecl } from '@regle/core';
import { withMessage } from '@regle/rules';
import type * as v from 'valibot';
import type { Ref } from 'vue';
import { processValibotTypeDef } from '../processValibotTypeDef';
import type { MaybeArrayAsync } from '../../../../types/valibot/valibot.schema.types';
import { extractIssuesMessages } from '../../extractIssuesMessages';

type ArraySchema = v.ArraySchema<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>, undefined>;
export function valibotArrayToRegle(
  schema:
    | MaybeArrayAsync<any>
    | v.SchemaWithPipe<[ArraySchema, ...v.BaseValidation<unknown, unknown, v.BaseIssue<unknown>>[]]>,
  state: Ref<unknown>
): RegleCollectionRuleDecl {
  let filteredSelfSchema: Record<string, any> = {};
  if ('pipe' in schema) {
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

  return {
    $each: processValibotTypeDef(schema.item, state),
    ...filteredSelfSchema,
  };
}
