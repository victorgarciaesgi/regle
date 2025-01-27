import type { ReglePartialRuleTree } from '@regle/core';
import type * as v from 'valibot';
import { toRef, type Ref } from 'vue';
import { processValibotTypeDef } from '../processValibotTypeDef';
import { isIntersectSchema, isObjectSchema, isWrappedType } from '../guards';
import { isObject } from '../../../../../../shared';
import type { MaybeObjectAsync, MaybeSchemaAsync } from '../../../../types/valibot/valibot.schema.types';

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
    return { entries: allEntries, type: 'object', kind: 'schema', async: false } as v.ObjectSchema<any, any>;
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
