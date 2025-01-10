import type { ReglePartialRuleTree } from '@regle/core';
import type { PossibleDefTypes } from '../../../types';
import type { z } from 'zod';
import { processZodTypeDef } from '../processZodTypeDef';
import { isObject } from '../../../../../shared';
import { required } from '@regle/rules';

export function zodDiscriminatedUnionToRegle(
  def: z.ZodDiscriminatedUnionDef<any>,
  state: unknown
): ReglePartialRuleTree<any, any> {
  if (isObject(state) && state[def.discriminator]) {
    const selectedDiscriminant = def.optionsMap.get(state[def.discriminator]);
    if (selectedDiscriminant) {
      return Object.fromEntries(
        Object.entries(selectedDiscriminant._def.shape()).map(([key, shape]) => {
          if (typeof shape === 'object' && '_def' in shape) {
            const def = shape._def as PossibleDefTypes;
            return [key, processZodTypeDef(def, shape, state)];
          }
          return [key, {}];
        })
      );
    }
    return {};
  }
  return {
    [def.discriminator]: { required },
  };
}
