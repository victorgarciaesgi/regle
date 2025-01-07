import type { FormRuleDeclaration, RegleRuleDefinition, RegleRuleRaw } from '@regle/core';
import { createRule } from '@regle/core';
import type {
  ExtractParamsFromRules,
  ExtractValueFromRules,
  GuessAsyncFromRules,
  GuessMetadataFromRules,
  UnwrapTuples,
} from '../types';

/**
 * The or operator validates successfully if at least one of the provided rules is valid.
 */
export function or<TRules extends FormRuleDeclaration<any, any>[]>(
  ...rules: [...TRules]
): RegleRuleDefinition<
  ExtractValueFromRules<TRules>[number],
  UnwrapTuples<ExtractParamsFromRules<TRules>>,
  GuessAsyncFromRules<TRules>,
  GuessMetadataFromRules<TRules>
> {
  const isAnyRuleAsync = rules.some((rule) => {
    if (typeof rule === 'function') {
      return rule.constructor.name === 'AsyncFunction';
    } else {
      return rule._async;
    }
  });

  const _params = rules
    .map((rule) => {
      if (typeof rule === 'function') {
        return null;
      } else {
        return rule._params;
      }
    })
    .flat()
    .filter((param): param is any => !!param);

  function computeRules(rules: [...TRules], value: any, ...params: any[]) {
    const $rules: any[] = [];
    let paramIndex = 0;

    for (let rule of rules) {
      if (typeof rule === 'function') {
        $rules.push(rule(value));
        paramIndex++;
      } else {
        const paramsLength = rule._params?.length ?? 0;
        $rules.push(rule.validator(value, ...params.slice(paramIndex, paramsLength)));
        if (paramsLength) {
          paramIndex += paramsLength;
        }
      }
    }

    return $rules;
  }

  function computeMetadata(
    results: (boolean | { $valid: boolean; [x: string]: any })[]
  ): boolean | { $valid: boolean; [x: string]: any } {
    const isAnyResultMetaData = results.some((s) => typeof s !== 'boolean');
    if (isAnyResultMetaData) {
      return {
        $valid: results.some((result) => {
          if (typeof result === 'boolean') {
            return !!result;
          }
          return result.$valid;
        }),
        ...results.reduce((acc, result) => {
          if (typeof result === 'boolean') {
            return acc;
          }
          const { $valid, ...rest } = result;
          return { ...acc, ...rest };
        }, {}),
      };
    } else {
      return results.some((result) => !!result);
    }
  }

  const validator = isAnyRuleAsync
    ? async (value: any | null | undefined, ...params: any[]) => {
        const results = await Promise.all(computeRules(rules, value, ...params));
        return computeMetadata(results);
      }
    : (value: any | null | undefined, ...params: any[]) => {
        const $rules = computeRules(rules, value, ...params);
        return computeMetadata($rules);
      };

  const newRule = createRule({
    type: 'or',
    validator: validator as any,
    message: 'The value does not match any of the provided validators',
  }) as RegleRuleRaw;

  const newParams = [...(_params ?? [])] as [];
  newRule._params = newParams as any;

  if (typeof newRule === 'function') {
    const executedRule = newRule(...newParams);
    executedRule._message_patched = true;
    return executedRule as any;
  } else {
    return newRule as any;
  }
}
