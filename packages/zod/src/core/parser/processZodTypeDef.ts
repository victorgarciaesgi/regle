import type { RegleFormPropertyType } from '@regle/core';
import { withMessage } from '@regle/rules';
import z from 'zod';
import { extractIssuesMessages, transformZodValidatorAdapter, zodArrayToRegle, zodObjectToRegle } from './validators';
import type { PossibleDefTypes } from '../../types';

function getNestedInnerType(def: PossibleDefTypes) {
  if (def && typeof def === 'object' && 'typeName' in def) {
    let finalDef = def;
    if (def.typeName === z.ZodFirstPartyTypeKind.ZodDefault || def.typeName === z.ZodFirstPartyTypeKind.ZodCatch) {
      finalDef = def.innerType._def;
    }
    if ('innerType' in finalDef) {
      return getNestedInnerType(finalDef.innerType._def);
    }
    return finalDef;
  }
  return undefined;
}

export function processZodTypeDef(def: PossibleDefTypes, schema: z.ZodSchema<any>): RegleFormPropertyType {
  const schemaDef = getNestedInnerType(def);
  if (schemaDef) {
    if (schemaDef.typeName === z.ZodFirstPartyTypeKind.ZodArray) {
      return zodArrayToRegle(schemaDef, schema);
    } else if (schemaDef.typeName === z.ZodFirstPartyTypeKind.ZodObject) {
      return zodObjectToRegle(schemaDef);
    } else {
      return {
        [schema.constructor.name]: withMessage(
          transformZodValidatorAdapter(schema) as any,
          extractIssuesMessages() as any
        ),
      };
    }
  }
  return {};
}
