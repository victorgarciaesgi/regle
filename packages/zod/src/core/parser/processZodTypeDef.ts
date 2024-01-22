import { RegleFormPropertyType } from '@regle/core';
import z from 'zod';
import { PossibleDefTypes } from '../../types';
import { zodArrayToRegle, zodChecksToRegleMessages, zodObjectToRegle } from './validators';

export function processZodTypeDef(
  def: PossibleDefTypes,
  schema: z.ZodSchema<any>
): RegleFormPropertyType {
  if (def && typeof def === 'object' && 'typeName' in def) {
    if (def.typeName === z.ZodFirstPartyTypeKind.ZodAny) {
    } else if ('checks' in def) {
      return zodChecksToRegleMessages(def, schema);
    } else if (def.typeName === z.ZodFirstPartyTypeKind.ZodArray) {
      return zodArrayToRegle(def, schema);
    } else if (def.typeName === z.ZodFirstPartyTypeKind.ZodObject) {
      return zodObjectToRegle(def, schema);
    }

    // switch (def.typeName) {
    //   case z.ZodFirstPartyTypeKind.ZodOptional:
    //   case z.ZodFirstPartyTypeKind.ZodDefault:
    //   case z.ZodFirstPartyTypeKind.ZodNullable:
    //   case z.ZodFirstPartyTypeKind.ZodReadonly:
    //     return processZodTypeDef(def.innerType._def, def.innerType);
    //   case z.ZodFirstPartyTypeKind.ZodEffects:
    //     return processZodTypeDef(def.schema._def, def.schema);
    //   case z.ZodFirstPartyTypeKind.ZodBoolean:
    //     return zodBooleanToRegle(def, schema);
    //   case z.ZodFirstPartyTypeKind.ZodDate:
    //     return zodDateToRegle(def, schema);
    //   case z.ZodFirstPartyTypeKind.ZodBranded:
    //     return processZodTypeDef(def.type._def, def.type);
    //   case z.ZodFirstPartyTypeKind.ZodBigInt:
    //     return zodBigIntToRegle(def, schema);
    //   case z.ZodFirstPartyTypeKind.ZodTuple:
    //     return zodArrayToRegle(def, schema);
    //   default:
    //     return {};
    // }
    // else {
    //   def.typeName satisfies never;
    // }
  }

  return {};
}
