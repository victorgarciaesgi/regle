import type { FormRuleDeclaration, RegleRuleMetadataDefinition } from '@regle/core';
import { withAsync, withParams } from '@regle/rules';
import type * as v from 'valibot';
import type { MaybeSchemaAsync } from '../../../../types/valibot/valibot.schema.types';
import type { Ref } from 'vue';

export function transformValibotAdapter(
  schema?: MaybeSchemaAsync<unknown>,
  additionalIssues?: Ref<v.BaseIssue<any>[] | undefined>
) {
  const isAsync = schema?.async;

  const validatorFn = (value: unknown): RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition> => {
    console.log(value, additionalIssues?.value);
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

    if (!result.issues) {
      return {
        $valid: true,
        $issues: [],
      };
    } else {
      return {
        $valid: false,
        // additionalIssues should already contain field error if there is a refinement in a parent
        $issues: result?.issues ?? [],
      };
    }
  };

  if (schema && '__depsArray' in schema && Array.isArray(schema.__depsArray) && schema.__depsArray.length) {
    return isAsync ? withAsync(validatorFn, schema.__depsArray) : withParams(validatorFn as any, schema.__depsArray);
  }
  return isAsync ? withAsync(validatorFn) : validatorFn;
}

function trySafeTransform(
  schema: MaybeSchemaAsync<unknown> | undefined,
  value: unknown
):
  | v.SafeParseResult<v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>>
  | Promise<{ $valid: boolean; $issues: v.BaseIssue<unknown>[] }> {
  try {
    if (schema?.async) {
      return new Promise<{ $valid: boolean; $issues: any[] }>(async (resolve) => {
        const result = await schema['~standard'].validate(value);
        if (!result.issues) {
          resolve({
            $valid: true,
            $issues: [],
          });
        } else {
          resolve({
            $valid: false,
            $issues: result.issues as v.BaseIssue<unknown>[],
          });
        }
      });
    } else {
      const result = schema?.['~standard'].validate(value) as v.StandardResult<unknown>;
      return result as v.SafeParseResult<any>;
    }
  } catch (e) {
    return {} as any;
  }
}
