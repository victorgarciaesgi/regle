import type { RegleFormPropertyType } from '@regle/core';
import { withMessage } from '@regle/rules';
import type * as v from 'valibot';
import {
  extractIssuesMessages,
  transformValibotAdapter,
  valibotArrayToRegle,
  valibotObjectToRegle,
} from './validators';

function isArraySchema(
  schema: v.BaseSchema<unknown, unknown, any>
): schema is v.ArraySchema<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>, undefined> {
  return schema.type === 'array';
}

function isObjectSchema(
  schema: v.BaseSchema<unknown, unknown, any>
): schema is v.ObjectSchema<v.ObjectEntries, undefined> {
  return schema.type === 'object';
}

export function processValibotTypeDef(
  schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
): RegleFormPropertyType {
  if (isArraySchema(schema)) {
    return valibotArrayToRegle(schema);
  } else if (isObjectSchema(schema)) {
    return valibotObjectToRegle(schema);
  } else {
    return {
      [schema.type]: withMessage(transformValibotAdapter(schema) as any, extractIssuesMessages() as any),
    };
  }
}
