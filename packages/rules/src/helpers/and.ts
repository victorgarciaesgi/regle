import type { FormRuleDeclaration, RegleRuleDefinition } from '@regle/core';
import type {
  ExtractValueFromRules,
  ExtractParamsFromRules,
  UnwrapTuples,
  GuessAsyncFromRules,
  GuessMetadataFromRules,
  GuessNoEmptyFromRules,
} from '../types';
import { combineRules } from './common/operatorsLogic';

/**
 * The `and` operator combines multiple rules and validates successfully only if **all** provided rules are valid.
 *
 * @param rules - Two or more rules to combine
 * @returns A combined rule that passes when all provided rules pass
 *
 * @example
 * ```ts
 * import { useRegle } from '@regle/core';
 * import { and, startsWith, endsWith, withMessage } from '@regle/rules';
 *
 * const { r$ } = useRegle(
 *   { regex: '' },
 *   {
 *     regex: {
 *       myError: withMessage(
 *         and(startsWith('^'), endsWith('$')),
 *         ({ $params: [start, end] }) =>
 *           `Regex should start with "${start}" and end with "${end}"`
 *       ),
 *     },
 *   }
 * );
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/rules-operators#and Documentation}
 */
export function and<const TRules extends [FormRuleDeclaration<any, any>, ...FormRuleDeclaration<any, any>[]]>(
  ...rules: [...TRules]
): RegleRuleDefinition<
  'and',
  ExtractValueFromRules<TRules>[number],
  UnwrapTuples<ExtractParamsFromRules<TRules>>,
  GuessAsyncFromRules<TRules>,
  GuessMetadataFromRules<TRules>,
  ExtractValueFromRules<TRules>[number],
  ExtractValueFromRules<TRules>[number],
  GuessNoEmptyFromRules<TRules>
> {
  return combineRules(rules, {
    mode: 'and',
    message: 'The value does not match all of the provided validators',
  });
}
