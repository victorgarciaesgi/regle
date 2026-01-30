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
 * The `xor` operator validates successfully if **exactly one** of the provided rules is valid (exclusive or).
 *
 * @param rules - Two or more rules to combine
 * @returns A combined rule that passes when exactly one of the provided rules passes
 *
 * @example
 * ```ts
 * import { useRegle } from '@regle/core';
 * import { xor, contains, withMessage } from '@regle/rules';
 *
 * const { r$ } = useRegle(
 *   { code: '' },
 *   {
 *     code: {
 *       myError: withMessage(
 *         xor(contains('A'), contains('B')),
 *         ({ $params: [charA, charB] }) =>
 *           `Field should contain either "${charA}" or "${charB}", but not both`
 *       ),
 *     },
 *   }
 * );
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/rules-operators#xor Documentation}
 */
export function xor<TRules extends [FormRuleDeclaration<any, any>, ...FormRuleDeclaration<any, any>[]]>(
  ...rules: [...TRules]
): RegleRuleDefinition<
  ExtractValueFromRules<TRules>[number],
  UnwrapTuples<ExtractParamsFromRules<TRules>>,
  GuessAsyncFromRules<TRules>,
  GuessMetadataFromRules<TRules>
> {
  return combineRules(rules, {
    mode: 'xor',
    message: 'The value does not match exactly one of the provided validators',
  });
}
