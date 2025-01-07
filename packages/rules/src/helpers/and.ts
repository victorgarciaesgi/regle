import type { FormRuleDeclaration, RegleRuleDefinition, RegleRuleDefinitionProcessor, RegleRuleRaw } from '@regle/core';
import { createRule } from '@regle/core';
import type {
  ExtractValueFromRules,
  ExtractParamsFromRules,
  UnwrapTuples,
  GuessAsyncFromRules,
  GuessMetadataFromRules,
} from '../types';

/**
 * The and operator combines multiple rules and validates successfully only if all provided rules are valid.
 */
export function and<TRules extends FormRuleDeclaration<any, any>[]>(
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
        const $params = rule._params;
        if (!$params?.length) {
          return [];
        } else {
          return $params;
        }
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
    const isAnyResultMetaData = results?.some((s) => typeof s !== 'boolean');
    if (isAnyResultMetaData) {
      return {
        $valid: results.every((result) => {
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
      return results.every((result) => !!result);
    }
  }

  let validator: RegleRuleDefinitionProcessor;

  if (!!rules.length) {
    validator = isAnyRuleAsync
      ? async (value: any | null | undefined, ...params: any[]) => {
          const results = await Promise.all(computeRules(rules, value, ...params));
          return computeMetadata(results);
        }
      : (value: any | null | undefined, ...params: any[]) => {
          const $rules = computeRules(rules, value, ...params);
          return computeMetadata($rules);
        };
  } else {
    validator = (value: any) => {
      return false;
    };
  }

  const newRule = createRule({
    type: 'and',
    validator: validator,
    message: 'The value does not match all of the provided validators',
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
