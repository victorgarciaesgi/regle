import type { ReglePartialRuleTree } from '@regle/core';
import type { PossibleDefTypes } from '../../../types';
import type { z } from 'zod';
import { processZodTypeDef } from '../processZodTypeDef';
import { isObject } from '../../../../../shared';

export function zodObjectToRegle(def: z.ZodObjectDef, state: unknown): ReglePartialRuleTree<any, any> {
  return Object.fromEntries(
    Object.entries(def.shape()).map(([key, shape]) => {
      if (typeof shape === 'object' && '_def' in shape) {
        const def = shape._def as PossibleDefTypes;
        const childState = isObject(state) ? state[key] : null;
        return [key, processZodTypeDef(def, shape, childState)];
      }
      return [key, {}];
    })
  );
}
