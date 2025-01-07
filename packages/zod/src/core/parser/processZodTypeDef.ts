import type { RegleFormPropertyType } from '@regle/core';
import { withMessage } from '@regle/rules';
import z from 'zod';
import { extractIssuesMessages, transformZodValidatorAdapter, zodArrayToRegle, zodObjectToRegle } from './validators';
import type { PossibleDefTypes } from '../../types';
import { zodDiscriminatedUnionToRegle } from './validators/zodDiscriminatedUnionToRegle';

const typesWithInnerTypes = [
  z.ZodFirstPartyTypeKind.ZodDefault,
  z.ZodFirstPartyTypeKind.ZodCatch,
  z.ZodFirstPartyTypeKind.ZodNullable,
  z.ZodFirstPartyTypeKind.ZodOptional,
  z.ZodFirstPartyTypeKind.ZodReadonly,
] as const;

function isDefWithInnerType(
  def: PossibleDefTypes
): def is typeof def & { typeName: (typeof typesWithInnerTypes)[number] } {
  if (def && typeof def === 'object' && 'typeName' in def) {
    return typesWithInnerTypes.includes(def.typeName);
  }
  return false;
}

function getNestedInnerType(def: PossibleDefTypes) {
  if (def && typeof def === 'object' && 'typeName' in def) {
    let finalDef = def;
    if (isDefWithInnerType(def)) {
      finalDef = def.innerType._def;
    }
    if ('innerType' in finalDef) {
      return getNestedInnerType(finalDef.innerType._def);
    }
    return finalDef;
  }
  return undefined;
}

export function processZodTypeDef(
  def: PossibleDefTypes,
  schema: z.ZodSchema<any>,
  state: unknown
): RegleFormPropertyType {
  const schemaDef = getNestedInnerType(def);
  if (schemaDef) {
    if (schemaDef.typeName === z.ZodFirstPartyTypeKind.ZodArray) {
      return zodArrayToRegle(schemaDef, schema, state);
    } else if (schemaDef.typeName === z.ZodFirstPartyTypeKind.ZodObject) {
      return zodObjectToRegle(schemaDef, state);
    } else if (schemaDef.typeName === z.ZodFirstPartyTypeKind.ZodDiscriminatedUnion) {
      return zodDiscriminatedUnionToRegle(schemaDef, state);
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
