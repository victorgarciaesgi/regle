import type { ReglePartialRuleTree } from '@regle/core';
import { toRef, type Ref } from 'vue';
import type { z } from 'zod';
import { processZodTypeDef } from '../processZodTypeDef';
import { isObject } from '../../../../../../shared';

function getNestedZodObjectSchema(schema: z.ZodType): z.ZodObject<any> | undefined {
  if (schema._def && 'typeName' in schema._def) {
    if (schema._def.typeName === 'ZodEffects') {
      return getNestedZodObjectSchema((schema as z.ZodEffects<any>)._def.schema);
    } else if (schema._def.typeName === 'ZodIntersection') {
      const leftObject = getNestedZodObjectSchema((schema as z.ZodIntersection<any, any>)._def.left);
      const rightObject = getNestedZodObjectSchema((schema as z.ZodIntersection<any, any>)._def.right);
      if (leftObject && rightObject) {
        return getNestedZodObjectSchema(leftObject.merge(rightObject));
      }
      return undefined;
    } else {
      return schema as z.ZodObject<any>;
    }
  }
  return undefined;
}

export function zodObjectToRegle(
  schema: z.ZodObject<any> | z.ZodIntersection<any, any>,
  state: Ref<unknown>
): ReglePartialRuleTree<any, any> {
  if (schema && '_def' in schema && 'typeName' in schema._def) {
    const nestedSchema = getNestedZodObjectSchema(schema);
    if (nestedSchema?._def?.typeName === 'ZodObject') {
      return Object.fromEntries(
        Object.entries(nestedSchema._def.shape()).map(([key, shape]) => {
          if (shape && typeof shape === 'object' && '_def' in shape) {
            const childState = toRef(isObject(state.value) ? state.value : {}, key);
            return [key, processZodTypeDef(shape as z.ZodType, childState)];
          }
          return [key, {}];
        })
      );
    }
    return {};
  }
  return {};
}
