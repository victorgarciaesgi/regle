import type { RegleRuleMetadataDefinition } from '@regle/core';
import { withAsync, withParams } from '@regle/rules';
import type { Ref } from 'vue';
import type { z } from 'zod';

export function transformZodValidatorAdapter(
  schema?: z.ZodSchema<any>,
  additionalIssues?: Ref<z.ZodIssue[] | undefined>
) {
  const isAsync = hasAsyncRefinement(schema);

  // Regle validator function
  function validatorFn(value: unknown): RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition> {
    if (additionalIssues?.value?.length) {
      return {
        $valid: false,
        // additionalIssues should already contain field error if there is a refinement in a parent
        $issues: additionalIssues.value,
      };
    }

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
        // additionalIssues should already contain field error if there is a refinement in a parent
        $issues: result.error?.issues ?? [],
      };
    }
  }

  if (schema && '__depsArray' in schema && Array.isArray(schema.__depsArray) && schema.__depsArray.length) {
    return isAsync ? withAsync(validatorFn, schema.__depsArray) : withParams(validatorFn as any, schema.__depsArray);
  }

  return isAsync ? withAsync(validatorFn) : validatorFn;
}

function trySafeTransform(
  schema?: z.ZodTypeAny,
  value?: unknown
): z.SafeParseReturnType<any, any> | Promise<RegleRuleMetadataDefinition> {
  if (schema) {
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
              $issues: result.error?.issues,
            });
          }
        });
      } catch (e) {
        return {} as any;
      }
    }
  } else {
    return { success: true, data: {} };
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

function hasAsyncRefinement(schema?: z.ZodTypeAny): boolean {
  if (schema?._def) {
    if (schema._def.typeName === 'ZodEffects') {
      const effect = schema._def.effect;
      return isAsyncFunctionOrPromiseReturning(effect.refinement || effect.transform);
    }

    if (schema._def.typeName === 'ZodObject') {
      return Object.values(schema._def.shape()).some((schema) => hasAsyncRefinement(schema as any));
    }

    if (schema._def.typeName === 'ZodUnion' || schema._def.typeName === 'ZodIntersection') {
      return schema._def.options.some(hasAsyncRefinement);
    }

    if (schema._def.typeName === 'ZodArray') {
      return hasAsyncRefinement(schema._def.type);
    }

    if (schema._def.typeName === 'ZodOptional' || schema._def.typeName === 'ZodNullable') {
      return hasAsyncRefinement(schema._def.innerType);
    }

    if (schema._def.typeName === 'ZodTuple') {
      return schema._def.items.some(hasAsyncRefinement);
    }

    if (
      schema._def.typeName === 'ZodString' ||
      schema._def.typeName === 'ZodNumber' ||
      schema._def.typeName === 'ZodDate'
    ) {
      return schema._def.checks?.some((check: any) => isAsyncFunctionOrPromiseReturning(check.refinement));
    }
  }

  return false; // Default: No async refinements found
}
