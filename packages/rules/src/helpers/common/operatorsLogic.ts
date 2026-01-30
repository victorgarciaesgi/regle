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

type CombineMode = 'and' | 'or';

interface CombineRulesOptions {
  mode: CombineMode;
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
      $rules.push(rule.validator(value, ...params.slice(paramIndex, paramsLength)));
      if (paramsLength) {
        paramIndex += paramsLength;
      }
    }
  }

  return $rules;
}

/**
 * Computes the final metadata from rule results based on the combine mode
 * @param results - Array of rule results (boolean or metadata objects)
 * @param mode - 'and' uses every(), 'or' uses some()
 */
export function computeCombinedMetadata(results: RuleResult[], mode: CombineMode): RuleResult {
  const aggregator = mode === 'and' ? 'every' : 'some';
  const isAnyResultMetaData = results.some((s) => typeof s !== 'boolean');

  if (isAnyResultMetaData) {
    return {
      $valid: results[aggregator]((result) => {
        if (typeof result === 'boolean') {
          return !!result;
        }
        return result.$valid;
      }),
      ...results.reduce((acc, result) => {
        if (typeof result === 'boolean') {
          return acc;
        }
        const { $valid: _, ...rest } = result;
        return { ...acc, ...rest };
      }, {}),
    };
  } else {
    return results[aggregator]((result) => !!result);
  }
}

/**
 * Creates a combined rule from multiple rules using the specified mode (and/or)
 */
export function combineRules<const TRules extends [FormRuleDeclaration<any, any>, ...FormRuleDeclaration<any, any>[]]>(
  rules: [...TRules],
  options: CombineRulesOptions
): RegleRuleDefinition<
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
      ? async (value: any | null | undefined, ...params: any[]) => {
          const results = await Promise.all(computeRulesResults(rules, value, ...params));
          return computeCombinedMetadata(results, mode);
        }
      : (value: any | null | undefined, ...params: any[]) => {
          const results = computeRulesResults(rules, value, ...params);
          return computeCombinedMetadata(results, mode);
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
