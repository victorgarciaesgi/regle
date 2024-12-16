import type { ReglePartialRuleTree } from '@regle/core';
import type * as v from 'valibot';
import { processValibotTypeDef } from '../processValibotTypeDef';

export function valibotObjectToRegle(
  schema: v.ObjectSchema<v.ObjectEntries, undefined>
): ReglePartialRuleTree<any, any> {
  return Object.fromEntries(
    Object.entries(schema.entries).map(([key, shape]) => {
      if (typeof shape === 'object') {
        return [key, processValibotTypeDef(shape)];
      }
      return [key, {}];
    })
  );
}
