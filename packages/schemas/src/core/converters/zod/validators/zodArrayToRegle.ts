import type { RegleCollectionRuleDecl } from '@regle/core';
import { exactLength, maxLength, minLength } from '@regle/rules';
import type { z } from 'zod';
import { processZodTypeDef } from '../processZodTypeDef';
import type { Ref } from 'vue';

export function zodArrayToRegle(
  schema: z.ZodArray<any> | z.ZodTuple<any>,
  state: Ref<unknown>,
  additionalIssues?: Ref<z.ZodIssue[] | undefined>
): RegleCollectionRuleDecl {
  const arrayValidators =
    schema._def.typeName === 'ZodArray'
      ? {
          ...(!!schema._def.minLength && { minLength: minLength(schema._def.minLength?.value) }),
          ...(!!schema._def.maxLength && { maxLength: maxLength(schema._def.maxLength?.value) }),
          ...(!!schema._def.exactLength && { exactLength: exactLength(schema._def.exactLength?.value) }),
        }
      : {};

  const items = schema._def.typeName === 'ZodArray' ? schema._def.type : schema._def.items;
  return {
    $each: processZodTypeDef({ schema: items, state, additionalIssues }),
    ...arrayValidators,
  };
}
