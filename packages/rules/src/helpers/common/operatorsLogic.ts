import type {
  FormRuleDeclaration,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  RegleRuleMetadataExtended,
  RegleRuleRaw,
} from '@regle/core';
import { createRule } from '@regle/core';
import type {
  ExtractValueFromRules,
  ExtractParamsFromRules,
  UnwrapTuples,
  GuessAsyncFromRules,
  GuessMetadataFromRules,
  GuessNoEmptyFromRules,
} from '../../types';

type RuleResult = boolean | RegleRuleMetadataExtended;

type CombineMode = 'and' | 'or' | 'xor';

interface CombineRulesOptions<TType extends CombineMode | unknown = unknown> {
  mode: TType;
  message: string;
}

export function isAnyRuleAsync<TRules extends FormRuleDeclaration<any, any>[]>(rules: TRules): boolean {
  return rules.some((rule) => {
    if (typeof rule === 'function') {
      return rule.constructor.name === 'AsyncFunction';
    } else {
      return rule._async;
    }
  });
}

export function extractParamsFromRules<TRules extends FormRuleDeclaration<any, any>[]>(rules: TRules): any[] {
  return rules
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
    .filter((param) => !!param);
}

export function computeRulesResults<TRules extends FormRuleDeclaration<any, any>[]>(
  rules: TRules,
  value: any,
  ...params: any[]
): any[] {
  const $rules: any[] = [];
  let paramIndex = 0;

  for (const rule of rules) {
    if (typeof rule === 'function') {
      $rules.push(rule(value));
      paramIndex++;
    } else {
      const paramsLength = rule._params?.length ?? 0;
      $rules.push(rule.validator(value, ...params.slice(paramIndex, paramIndex + paramsLength)));
      if (paramsLength) {
        paramIndex += paramsLength;
      }
    }
  }

  return $rules;
}

/**
 * Computes validity based on the combine mode
 * @param results - Array of rule results (boolean or metadata objects)
 * @param mode - 'and' uses every(), 'or' uses some(), 'xor' checks exactly one is valid
 */
function computeValidity(value: unknown, results: RuleResult[], mode: CombineMode): boolean {
  const getValid = (result: RuleResult): boolean => {
    if (typeof result === 'boolean') {
      return !!result;
    }
    return result.$valid;
  };

  if (mode === 'xor') {
    if (results.length > 1) {
      const validCount = results.filter(getValid).length;
      return validCount === 1;
    }
    return results.every(getValid);
  }

  const aggregator = mode === 'and' ? 'every' : 'some';
  return results[aggregator](getValid);
}

/**
 * Computes the final metadata from rule results based on the combine mode
 * @param results - Array of rule results (boolean or metadata objects)
 * @param mode - 'and' uses every(), 'or' uses some(), 'xor' checks exactly one is valid
 */
export function computeCombinedMetadata(value: unknown, results: RuleResult[], mode: CombineMode): RuleResult {
  const isAnyResultMetaData = results.some((s) => typeof s !== 'boolean');

  if (isAnyResultMetaData) {
    return {
      $valid: computeValidity(value, results, mode),
      ...results.reduce((acc, result) => {
        if (typeof result === 'boolean') {
          return acc;
        }
        const { $valid: _, ...rest } = result;
        return { ...acc, ...rest };
      }, {}),
    };
  } else {
    return computeValidity(value, results, mode);
  }
}

/**
 * Creates a combined rule from multiple rules using the specified mode (and/or)
 */
export function combineRules<
  TType extends CombineMode,
  const TRules extends [FormRuleDeclaration<any, any>, ...FormRuleDeclaration<any, any>[]],
>(
  rules: [...TRules],
  options: CombineRulesOptions<TType>
): RegleRuleDefinition<
  TType,
  ExtractValueFromRules<TRules>[number],
  UnwrapTuples<ExtractParamsFromRules<TRules>>,
  GuessAsyncFromRules<TRules>,
  GuessMetadataFromRules<TRules>,
  ExtractValueFromRules<TRules>[number],
  ExtractValueFromRules<TRules>[number],
  GuessNoEmptyFromRules<TRules>
> {
  const { mode, message } = options;
  const isAsync = isAnyRuleAsync(rules);
  const _params = extractParamsFromRules(rules);

  let validator: RegleRuleDefinitionProcessor;

  if (rules.length) {
    validator = isAsync
      ? async (value: unknown, ...params: any[]) => {
          const results = await Promise.all(computeRulesResults(rules, value, ...params));
          return computeCombinedMetadata(value, results, mode);
        }
      : (value: unknown, ...params: any[]) => {
          const results = computeRulesResults(rules, value, ...params);
          return computeCombinedMetadata(value, results, mode);
        };
  } else {
    // For empty rules: 'and' returns false (nothing to satisfy), 'or' also returns false (nothing passes)
    validator = (_value: any) => {
      return false;
    };
  }

  const newRule = createRule({
    type: mode,
    validator: validator,
    message: message,
  }) as RegleRuleRaw;

  const newParams = [...(_params ?? [])];
  newRule._params = newParams;

  if (typeof newRule === 'function') {
    const executedRule = newRule(...newParams);
    return executedRule as any;
  } else {
    return newRule as any;
  }
}
