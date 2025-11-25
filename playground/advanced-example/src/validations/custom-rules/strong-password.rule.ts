import type { Maybe } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '@regle/rules';
import { passwordStrength, type DiversityType, type Options } from 'check-password-strength';

const diversityTypes: DiversityType[] = ['lowercase', 'uppercase', 'symbol', 'number'];
const diversityMessages: Record<DiversityType, string> = {
  lowercase: 'At least one owercase letter (a-z)',
  uppercase: 'At least one uppercase letter (A-Z)',
  number: 'At least one number (0-9)',
  symbol: 'At least one symbol ($€@&..)',
};

export const strongPassword = createRule({
  validator: (value: Maybe<string>, options?: Options<string>) => {
    if (isFilled(value)) {
      const result = passwordStrength(value, options);
      return {
        $valid: result.id > 1,
        result,
      };
    }
    return { $valid: true };
  },
  message({ result }) {
    return `Your password is ${result?.value.toLocaleLowerCase()}`;
  },
  tooltip({ result, $dirty }) {
    if ($dirty) {
      let diversity = diversityTypes
        .filter((f) => !result?.contains.includes(f))
        .map((value) => diversityMessages[value]);
      if ((result?.length ?? 0) < 8) {
        diversity.push('At least 8 characters');
      }
      return diversity;
    }
    return [];
  },
});
