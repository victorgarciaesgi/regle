import type { RegleRuleMetadataDefinition } from '@regle/core';
import { withAsync } from '@regle/rules';
import type { z } from 'zod';

export function transformZodValidatorAdapter(schema: z.ZodSchema<any>) {
  const isAsync = hasAsyncRefinement(schema);
  const validatorFn = (
    value: unknown
  ): RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition> => {
    const result = trySafeTransform(schema, value);

    if (result instanceof Promise) {
      return result;
    }

    if (result.success) {
      return {
        $valid: true,
        $issues: [],
      };
    } else {
      return {
        $valid: false,
        $issues: result.error.issues,
      };
    }
  };

  return isAsync ? withAsync(validatorFn) : validatorFn;
}

function trySafeTransform(
  schema: z.ZodTypeAny,
  value: unknown
): z.SafeParseReturnType<any, any> | Promise<RegleRuleMetadataDefinition> {
  try {
    const result = schema.safeParse(value);
    return result;
  } catch (e) {
    try {
      return new Promise<RegleRuleMetadataDefinition>(async (resolve) => {
        const result = await schema.safeParseAsync(value);
        if (result.success) {
          resolve({
            $valid: true,
            $issues: [],
          });
        } else {
          resolve({
            $valid: false,
            $issues: result.error.issues,
          });
        }
      });
    } catch (e) {
      return {} as any;
    }
  }
}

function isAsyncFunctionOrPromiseReturning(fn: unknown): boolean {
  if (typeof fn !== 'function') return false;
  if (fn.constructor.name === 'AsyncFunction') {
    return true;
  }
  try {
    const result = fn();
    return result instanceof Promise;
  } catch {
    return false;
  }
}

function hasAsyncRefinement(schema: z.ZodTypeAny): boolean {
  if (schema._def.typeName === 'ZodEffects') {
    // Handle ZodEffects (used for refinements and transformations)
    const effect = schema._def.effect;
    if (effect?.type === 'refinement' || effect?.type === 'transform') {
      return isAsyncFunctionOrPromiseReturning(effect.refinement || effect.transform);
    }
    if (effect?.type === 'preprocess') {
      // Preprocessors can include nested schemas
      return hasAsyncRefinement(effect.schema);
    }
  }

  if (schema._def.typeName === 'ZodObject') {
    // Check each field in a ZodObject
    return Object.values(schema._def.shape()).some((schema) => hasAsyncRefinement(schema as any));
  }

  if (schema._def.typeName === 'ZodUnion' || schema._def.typeName === 'ZodIntersection') {
    // Check each option in a ZodUnion or ZodIntersection
    return schema._def.options.some(hasAsyncRefinement);
  }

  if (schema._def.typeName === 'ZodArray') {
    // Check the array's element schema
    return hasAsyncRefinement(schema._def.type);
  }

  if (schema._def.typeName === 'ZodOptional' || schema._def.typeName === 'ZodNullable') {
    // Check the wrapped schema
    return hasAsyncRefinement(schema._def.innerType);
  }

  if (schema._def.typeName === 'ZodTuple') {
    // Check each item in a ZodTuple
    return schema._def.items.some(hasAsyncRefinement);
  }

  if (
    schema._def.typeName === 'ZodString' ||
    schema._def.typeName === 'ZodNumber' ||
    schema._def.typeName === 'ZodDate'
  ) {
    // Check for async refinements in primitive types
    return schema._def.checks?.some((check: any) =>
      isAsyncFunctionOrPromiseReturning(check.refinement)
    );
  }

  // Add other cases if needed (e.g., ZodRecord, ZodMap, etc.)

  return false; // Default: No async refinements found
}
