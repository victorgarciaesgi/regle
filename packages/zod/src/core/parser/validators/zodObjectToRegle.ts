import type { ReglePartialRuleTree } from '@regle/core';
import type { PossibleDefTypes } from '../../../types';
import type { z } from 'zod';
import { processZodTypeDef } from '../processZodTypeDef';

export function zodObjectToRegle(def: z.ZodObjectDef): ReglePartialRuleTree<any, any> {
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
