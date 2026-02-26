import { isFilled, regex } from '@regle/rules';
import { createRule, type MaybeInput, type RegleRuleWithParamsDefinition } from '@regle/core';

/**
 * Requires a string field to contain at least a given number of uppercase letters.
 *
 * @example
 * ```ts
 * import { useRegle, containsUppercase } from '@regle/rules';
 *
 * const { r$ } = useRegle({ password: '' }, {
 *   password: { containsUppercase },
 *   // or with a minimum number of uppercase letters
 *   password: { containsUppercase: containsUppercase(2) }
 * })
 * ```
 * @param minUppercaseCount - The minimum number of uppercase letters to contain.
 * @returns A rule that validates the string field.
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#containsUppercase Documentation}
 */
export const containsUppercase: RegleRuleWithParamsDefinition<
  'containsUppercase',
  string,
  [minUppercaseCount?: number | undefined],
  false,
  { $valid: boolean; minUppercaseCount: number },
  string,
  string,
  false
> = createRule({
  type: 'containsUppercase',
  validator(value: MaybeInput<string>, minUppercaseCount: number = 1) {
    const minOccurrences = Number.isFinite(minUppercaseCount) ? Math.max(1, Math.floor(minUppercaseCount)) : 1;

    if (isFilled(value)) {
      const containsUppercaseRegex = new RegExp(`^(?:.*[A-Z]){${minOccurrences},}.*$`);
      return {
        $valid: regex(containsUppercaseRegex).exec(value),
        minUppercaseCount: minOccurrences,
      };
    }
    return {
      $valid: true,
      minUppercaseCount: minOccurrences,
    };
  },
  message: ({ minUppercaseCount }) => {
    return `This field must contain at least ${minUppercaseCount} uppercase letter${minUppercaseCount > 1 ? 's' : ''}`;
  },
});
