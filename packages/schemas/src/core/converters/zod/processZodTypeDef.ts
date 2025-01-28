import type { RegleFormPropertyType } from '@regle/core';
import { withMessage, withParams } from '@regle/rules';
import type { Ref } from 'vue';
import type { ZodArray, ZodTuple, z, ZodTypeAny } from 'zod';
import { transformZodValidatorAdapter, zodArrayToRegle, zodObjectToRegle } from './validators';
import { zodDiscriminatedUnionToRegle } from './validators/zodDiscriminatedUnionToRegle';
import { extractIssuesMessages } from '../extractIssuesMessages';

const typesWithInnerTypes = ['ZodDefault', 'ZodCatch', 'ZodNullable', 'ZodOptional', 'ZodReadonly'] as const;

function isDefWithInnerType(
  schema: z.ZodType<any>
): schema is z.ZodType<any> & { _def: typeof schema._def & { innerType: z.ZodType<any> } } {
  if (schema._def && typeof schema._def === 'object' && 'typeName' in schema._def) {
    return typesWithInnerTypes.includes(schema._def.typeName as any);
  }
  return false;
}

function isDefWithInnerSchema(
  schema: z.ZodType<any>
): schema is z.ZodType<any> & { _def: typeof schema._def & { schema: z.ZodType<any> } } {
  if (schema._def && typeof schema._def === 'object' && 'typeName' in schema._def) {
    return 'schema' in schema._def;
  }
  return false;
}

export function getNestedInnerType(schema: z.ZodType<any>): z.ZodType<any> | undefined {
  if (schema?._def && typeof schema._def === 'object' && 'typeName' in schema._def) {
    if (isDefWithInnerType(schema)) {
      return getNestedInnerType(schema._def.innerType);
    } else if (isDefWithInnerSchema(schema)) {
      return getNestedInnerType(schema._def.schema as ZodTypeAny);
    } else {
      return schema;
    }
  }
  return undefined;
}

export function processZodTypeDef({
  schema,
  state,
  additionalIssues,
}: {
  schema: z.ZodSchema<any>;
  state: Ref<unknown>;
  additionalIssues?: Ref<z.ZodIssue[] | undefined>;
}): RegleFormPropertyType {
  const schemaDef = getNestedInnerType(schema);
  if (schemaDef?._def && 'typeName' in schemaDef._def) {
    if (schemaDef._def.typeName === 'ZodArray' || schemaDef._def.typeName === 'ZodTuple') {
      const schemaRef = zodArrayToRegle(schema as ZodArray<any> | ZodTuple<any>, state, additionalIssues);
      return schemaRef.zodRule;
    } else if (schemaDef._def.typeName === 'ZodObject' || schemaDef._def.typeName === 'ZodIntersection') {
      const schemaRef = zodObjectToRegle(
        schemaDef as z.ZodObject<any> | z.ZodIntersection<any, any>,
        state,
        additionalIssues
      );
      return schemaRef.zodRule;
    } else if (schemaDef._def.typeName === 'ZodDiscriminatedUnion') {
      const schemaRef = zodDiscriminatedUnionToRegle(
        schemaDef as z.ZodDiscriminatedUnion<any, any>,
        state,
        additionalIssues
      );
      return schemaRef.zodRule;
    } else {
      if (additionalIssues) {
        return {
          [schemaDef.constructor.name]: withMessage(
            withParams(transformZodValidatorAdapter(schema, additionalIssues) as any, [state, additionalIssues]),
            extractIssuesMessages() as any
          ),
        };
      }
      return {
        [schemaDef.constructor.name]: withMessage(
          transformZodValidatorAdapter(schema) as any,
          extractIssuesMessages() as any
        ),
      };
    }
  }
  return {};
}
