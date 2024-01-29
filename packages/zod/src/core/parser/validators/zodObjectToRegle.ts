import { ReglePartialValidationTree } from '@regle/core';
import { PossibleDefTypes } from '../../../types';
import { z } from 'zod';
import { processZodTypeDef } from '../processZodTypeDef';

export function zodObjectToRegle(
  def: z.ZodObjectDef,
  schema: z.ZodSchema<any>
): ReglePartialValidationTree<any, any> {
  return Object.fromEntries(
    Object.entries(def.shape()).map(([key, shape]) => {
      if (typeof shape === 'object' && '_def' in shape) {
        const def = shape._def as PossibleDefTypes;
        return [key, processZodTypeDef(def, shape)];
      }
      return [key, {}];
    })
  );
}
