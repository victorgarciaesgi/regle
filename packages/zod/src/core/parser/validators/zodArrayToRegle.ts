import type { RegleCollectionRuleDecl } from '@regle/core';
import { exactLength, maxLength, minLength } from '@regle/rules';
import { z } from 'zod';
import { processZodTypeDef } from '../processZodTypeDef';

export function zodArrayToRegle(
  def: z.ZodArrayDef | z.ZodTupleDef,
  schema: z.ZodSchema<any>
): RegleCollectionRuleDecl {
  const arrayValidators =
    def.typeName === z.ZodFirstPartyTypeKind.ZodArray
      ? {
          ...(!!def.minLength && { minLength: minLength(def.minLength?.value) }),
          ...(!!def.maxLength && { maxLength: maxLength(def.maxLength?.value) }),
          ...(!!def.exactLength && { exactLength: exactLength(def.exactLength?.value) }),
        }
      : {};

  const items = def.typeName === z.ZodFirstPartyTypeKind.ZodArray ? def.type._def : def.items;
  return {
    $each: processZodTypeDef(items, schema),
    ...arrayValidators,
  };
}
