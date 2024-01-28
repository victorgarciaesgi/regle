import { createRule, defineType, FormRuleDeclaration, RegleRuleDefinition } from '@regle/core';
import {
  ExtractParamsFromRules,
  ExtractValueFromRules,
  GuessAsyncFromRules,
  GuessMetadataFromRules,
  UnwrapTuples,
} from '../types';

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

  const params = rules
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
    type: defineType('or'),
    validator: validator as any,
    message: 'The value does not match any of the provided validators',
  });

  newRule._params = params as any;

  return newRule as any;
}
