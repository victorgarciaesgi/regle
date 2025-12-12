import { isEmpty } from '../../../../shared';

/**
 * Tests a value against one or more regular expressions.
 * Returns `true` if the value is empty or matches **all** provided patterns.
 *
 * @param _value - The value to test
 * @param expr - One or more RegExp patterns to match against
 * @returns `true` if empty or all patterns match, `false` otherwise
 *
 * @example
 * ```ts
 * import { createRule, type Maybe } from '@regle/core';
 * import { isFilled, matchRegex } from '@regle/rules';
 *
 * const regex = createRule({
 *   validator(value: Maybe<string>, regexps: RegExp[]) {
 *     if (isFilled(value)) {
 *       return matchRegex(value, ...regexps);
 *     }
 *     return true;
 *   },
 *   message: 'Error'
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/validations-helpers#matchregex Documentation}
 */
export function matchRegex(_value: string | number | null | undefined, ...expr: RegExp[]): boolean {
  if (isEmpty(_value)) {
    return true;
  }
  const value = typeof _value === 'number' ? _value.toString() : _value;
  return expr.every((reg) => {
    reg.lastIndex = 0;
    return reg.test(value);
  });
}
