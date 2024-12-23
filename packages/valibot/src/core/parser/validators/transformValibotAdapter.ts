import type { FormRuleDeclaration, RegleRuleDefinition, RegleRuleMetadataDefinition, RegleRuleRaw } from '@regle/core';
import { withAsync } from '@regle/rules';
import * as v from 'valibot';

export function transformValibotAdapter(
  schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>
): FormRuleDeclaration<unknown, [], v.MaybePromise<{ $valid: boolean; $issues: v.BaseIssue<unknown>[] }>> {
  const isAsync = schema.async;
  const validatorFn = (value: unknown) => {
    const result = trySafeTransform(schema, value, isAsync);

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
        $issues: result.issues,
      };
    }
  };

  return isAsync ? withAsync(validatorFn) : validatorFn;
}

function trySafeTransform(
  schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
  value: unknown,
  isAsync: boolean
):
  | v.SafeParseResult<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>
  | Promise<{ $valid: boolean; $issues: v.BaseIssue<unknown>[] }> {
  try {
    if (isAsync) {
      return new Promise<{ $valid: boolean; $issues: any[] }>(async (resolve) => {
        const result = await v.safeParseAsync(schema, value);
        if (result.success) {
          resolve({
            $valid: true,
            $issues: [],
          });
        } else {
          resolve({
            $valid: false,
            $issues: result.issues,
          });
        }
      });
    } else {
      const result = v.safeParse(schema, value);
      return result;
    }
  } catch (e) {
    return {} as any;
  }
}
