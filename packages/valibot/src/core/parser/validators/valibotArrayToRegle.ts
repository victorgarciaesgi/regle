import type { RegleCollectionRuleDecl } from '@regle/core';
import { exactLength, maxLength, minLength, withMessage } from '@regle/rules';
import * as v from 'valibot';
import { processValibotTypeDef } from '../processValibotTypeDef';
import { transformValibotAdapter } from './transformValibotAdapter';
import { extractIssuesMessages } from './extractIssuesMessages';

type ArraySchema = v.ArraySchema<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>, undefined>;
export function valibotArrayToRegle(
  schema: ArraySchema | v.SchemaWithPipe<[ArraySchema, ...v.BaseValidation<unknown, unknown, v.BaseIssue<unknown>>[]]>
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
    $each: processValibotTypeDef(schema.item),
    ...filteredSelfSchema,
  };
}
