import type { RegleFormPropertyType } from '@regle/core';
import { withMessage } from '@regle/rules';
import type * as v from 'valibot';
import { transformValibotAdapter, valibotArrayToRegle, valibotObjectToRegle } from './validators';
import type { Ref } from 'vue';
import { valibotVariantToRegle } from './validators/valibotVariantToRegle';
import { extractIssuesMessages } from '../extractIssuesMessages';
import type { MaybeArrayAsync, MaybeSchemaAsync } from '../../../types/valibot/valibot.schema.types';
import { isWrappedType } from './guards';

function isArraySchema(schema: MaybeSchemaAsync<unknown>): schema is MaybeArrayAsync<any> {
  return schema.type === 'array';
}

function isObjectSchema(schema: MaybeSchemaAsync<unknown>): schema is v.ObjectSchema<v.ObjectEntries, undefined> {
  return schema.type === 'object';
}

function isVariantSchema(
  schema: MaybeSchemaAsync<unknown>
): schema is v.VariantSchema<any, v.VariantOptions<any>, any> {
  return schema.type === 'variant';
}

export function getNestedInnerType(schema: MaybeSchemaAsync<unknown>): MaybeSchemaAsync<unknown> {
  if (isWrappedType(schema)) {
    return getNestedInnerType(schema.wrapped);
  } else {
    return schema;
  }
}

export function processValibotTypeDef(schema: MaybeSchemaAsync<unknown>, state: Ref<unknown>): RegleFormPropertyType {
  const nestedSchema = getNestedInnerType(schema);
  if (isArraySchema(nestedSchema)) {
    return valibotArrayToRegle(nestedSchema, state);
  } else if (isObjectSchema(nestedSchema)) {
    return valibotObjectToRegle(nestedSchema, state);
  } else if (isVariantSchema(nestedSchema)) {
    const valibotRule = valibotVariantToRegle(nestedSchema, state);
    return valibotRule.valibotRule;
  } else {
    return {
      [nestedSchema.type]: withMessage(transformValibotAdapter(nestedSchema) as any, extractIssuesMessages() as any),
    };
  }
}
