import type { ReglePartialRuleTree } from '@regle/core';
import * as v from 'valibot';
import { toRef, type Ref } from 'vue';
import { isIntersectSchema, isObjectSchema, isWrappedType } from '../../../utils/guards';
import { processValibotTypeDef } from '../processValibotTypeDef';
import type { MaybeObjectAsync, MaybeSchemaAsync } from '../../../types';
import { isObject } from '../../../../../shared';

export function getNestedValibotObjectSchema(
  schema: MaybeSchemaAsync<unknown>
): v.ObjectSchema<v.ObjectEntries, undefined> | undefined {
  if (isIntersectSchema(schema)) {
    // reduce type bug ???
    const allEntries = (schema.options as any).reduce(
      (acc: v.ObjectEntries, value: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>) => {
        const nestedSchema = getNestedValibotObjectSchema(value);
        if (nestedSchema) {
          acc = {
            ...acc,
            ...nestedSchema.entries,
          };
        }
        return acc;
      },
      {} as v.ObjectEntries
    ) as v.ObjectEntries;
    return v.object({ ...allEntries });
  } else if (isObjectSchema(schema)) {
    return schema;
  } else if (isWrappedType(schema)) {
    return getNestedValibotObjectSchema(schema.wrapped);
  } else {
    return undefined;
  }
}

export function valibotObjectToRegle(
  schema: MaybeObjectAsync<any>,
  state: Ref<unknown>
): ReglePartialRuleTree<any, any> {
  const nestedSchema = getNestedValibotObjectSchema(schema);
  if (nestedSchema) {
    return Object.fromEntries(
      Object.entries(nestedSchema.entries).map(([key, shape]) => {
        if (typeof shape === 'object') {
          const childState = toRef(isObject(state.value) ? state.value : {}, key);
          return [key, processValibotTypeDef(shape, childState)];
        }
        return [key, {}];
      })
    );
  }
  return {};
}
