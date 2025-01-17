import type { RegleCollectionRuleDecl } from '@regle/core';
import { withMessage } from '@regle/rules';
import * as v from 'valibot';
import type { Ref } from 'vue';
import type { MaybeArrayAsync } from '../../../types';
import { processValibotTypeDef } from '../processValibotTypeDef';
import { extractIssuesMessages } from './extractIssuesMessages';
import { transformValibotAdapter } from './transformValibotAdapter';

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
        filteredSelfSchema[validation.type] = withMessage(
          transformValibotAdapter(v.pipe(v.array(v.any()), validation as any) as any) as any,
          extractIssuesMessages() as any
        );
      });
  }

  return {
    $each: processValibotTypeDef(schema.item, state),
    ...filteredSelfSchema,
  };
}
