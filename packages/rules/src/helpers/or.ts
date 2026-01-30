import type { FormRuleDeclaration, RegleRuleDefinition } from '@regle/core';
import type {
  ExtractParamsFromRules,
  ExtractValueFromRules,
  GuessAsyncFromRules,
  GuessMetadataFromRules,
  UnwrapTuples,
} from '../types';
import { combineRules } from './common/operatorsLogic';

/**
 * The `or` operator validates successfully if **at least one** of the provided rules is valid.
 *
 * @param rules - Two or more rules to combine
 * @returns A combined rule that passes when any of the provided rules pass
 *
 * @example
 * ```ts
 * import { useRegle } from '@regle/core';
 * import { or, startsWith, endsWith, withMessage } from '@regle/rules';
 *
 * const { r$ } = useRegle(
 *   { regex: '' },
 *   {
 *     regex: {
 *       myError: withMessage(
 *         or(startsWith('^'), endsWith('$')),
 *         ({ $params: [start, end] }) =>
 *           `Field should start with "${start}" or end with "${end}"`
 *       ),
 *     },
 *   }
 * );
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/rules-operators#or Documentation}
 */
export function or<TRules extends [FormRuleDeclaration<any, any>, ...FormRuleDeclaration<any, any>[]]>(
  ...rules: [...TRules]
): RegleRuleDefinition<
  ExtractValueFromRules<TRules>[number],
  UnwrapTuples<ExtractParamsFromRules<TRules>>,
  GuessAsyncFromRules<TRules>,
  GuessMetadataFromRules<TRules>
> {
  return combineRules(rules, {
    mode: 'or',
    message: 'The value does not match any of the provided validators',
  });
}
