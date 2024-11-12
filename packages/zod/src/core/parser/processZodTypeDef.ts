import type { RegleFormPropertyType } from '@regle/core';
import { withMessage } from '@regle/rules';
import z from 'zod';
import {
  extractIssuesMessages,
  transformZodValidatorAdapter,
  zodArrayToRegle,
  zodObjectToRegle,
} from './validators';
import type { PossibleDefTypes } from '../../types';

export function processZodTypeDef(
  def: PossibleDefTypes,
  schema: z.ZodSchema<any>
): RegleFormPropertyType {
  if (def && typeof def === 'object' && 'typeName' in def) {
    if (def.typeName === z.ZodFirstPartyTypeKind.ZodArray) {
      return zodArrayToRegle(def, schema);
    } else if (def.typeName === z.ZodFirstPartyTypeKind.ZodObject) {
      return zodObjectToRegle(def, schema);
    } else {
      return {
        [schema.constructor.name]: withMessage(
          transformZodValidatorAdapter(schema),
          extractIssuesMessages() as any
        ),
      };
    }
  }
  return {};
}
