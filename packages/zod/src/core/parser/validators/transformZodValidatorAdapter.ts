import type { RegleRuleMetadataDefinition } from '@regle/core';
import type { z } from 'zod';

export function transformZodValidatorAdapter(schema: z.ZodSchema<any>) {
  return (value: unknown): RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition> => {
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
