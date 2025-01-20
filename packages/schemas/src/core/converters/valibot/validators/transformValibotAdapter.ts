import type { FormRuleDeclaration, RegleRuleDefinition, RegleRuleMetadataDefinition, RegleRuleRaw } from '@regle/core';
import { withAsync, withParams } from '@regle/rules';
import * as v from 'valibot';
import type { MaybeSchemaAsync } from '../../../../types/valibot/valibot.schema.types';

export function transformValibotAdapter(
  schema: MaybeSchemaAsync<unknown>
): FormRuleDeclaration<unknown, [], v.MaybePromise<{ $valid: boolean; $issues: v.BaseIssue<unknown>[] }>> {
  const isAsync = schema.async;
  const validatorFn = (value: unknown) => {
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
        $issues: result.issues,
      };
    }
  };

  if ('__depsArray' in schema && Array.isArray(schema.__depsArray) && schema.__depsArray.length) {
    return isAsync ? withAsync(validatorFn, schema.__depsArray) : withParams(validatorFn as any, schema.__depsArray);
  }
  return isAsync ? withAsync(validatorFn) : validatorFn;
}

function trySafeTransform(
  schema: MaybeSchemaAsync<unknown>,
  value: unknown
):
  | v.SafeParseResult<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>
  | Promise<{ $valid: boolean; $issues: v.BaseIssue<unknown>[] }> {
  try {
    if (schema.async) {
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
