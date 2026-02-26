import { createRule, type MaybeInput, type RegleRuleWithParamsDefinition } from '@regle/core';
import { isFilled, regex } from '@regle/rules';

/**
 * Requires a string field to contain at least a given number of special characters.
 *
 * @example
 * ```ts
 * import { useRegle, containsSpecialCharacter } from '@regle/rules';
 *
 * const { r$ } = useRegle({ password: '' }, {
 *   password: {
 *     containsSpecialCharacter,
 *     // or with a minimum number of special characters
 *     containsSpecialCharacter: containsSpecialCharacter(2)
 *   }
 * })
 * ```
 * @param minCharactersCount - The minimum number of special characters to contain.
 * @returns A rule that validates the string field.
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#containsSpecialCharacter Documentation}
 */
export const containsSpecialCharacter: RegleRuleWithParamsDefinition<
  'containsSpecialCharacter',
  string,
  [minCharactersCount?: number | undefined],
  false,
  { $valid: boolean; minCharactersCount: number },
  string,
  string,
  false
> = createRule({
  type: 'containsSpecialCharacter',
  validator(value: MaybeInput<string>, minCharactersCount: number = 1) {
    const minOccurrences = Number.isFinite(minCharactersCount) ? Math.max(1, Math.floor(minCharactersCount)) : 1;

    if (isFilled(value)) {
      const specialCharacterPattern = `[!@~\`#£€$%^&*()_+\\-=[\\]{};':"\\\\|,.<>/?]`;
      const containsSpecialCharacterRegex = new RegExp(`^(?:.*${specialCharacterPattern}){${minOccurrences},}.*$`);
      return {
        $valid: regex(containsSpecialCharacterRegex).exec(value),
        minCharactersCount: minOccurrences,
      };
    }
    return {
      $valid: true,
      minCharactersCount: minOccurrences,
    };
  },
  message({ minCharactersCount }) {
    return `This field must contain at least ${minCharactersCount} special character${minCharactersCount > 1 ? 's' : ''}`;
  },
});
