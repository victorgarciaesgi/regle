import { createTimeout } from '@/utils/timeout';
import type { Maybe } from '@regle/core';
import { createRule, defineRegleConfig } from '@regle/core';
import { required, ruleHelpers, withMessage } from '@regle/rules';
import { passwordStrength, type DiversityType, type Options } from 'check-password-strength';

const diversityTypes: DiversityType[] = ['lowercase', 'uppercase', 'symbol', 'number'];
const diversityMessages: Record<DiversityType, string> = {
  lowercase: 'At least one owercase letter (a-z)',
  uppercase: 'At least one uppercase letter (A-Z)',
  number: 'At least one number (0-9)',
  symbol: 'At least one symbol ($€@&..)',
};

function randomBoolean(): boolean {
  return [1, 2][Math.floor(Math.random() * 2)] === 1 ? true : false;
}

const timeout = createTimeout();

export const checkPseudo = createRule({
  async validator(value: Maybe<string>) {
    if (ruleHelpers.isFilled(value)) {
      // Check the timeout function to see how cancellation can be handled
      await timeout(2000);
      return randomBoolean();
    }
    return true;
  },
  message: 'The pseudo is already taken',
});

export const strongPassword = createRule({
  validator: (value: Maybe<string>, options?: Options<string>) => {
    if (ruleHelpers.isFilled(value)) {
      const result = passwordStrength(value, options);
      return {
        $valid: result.id > 1,
        result,
      };
    }
    return { $valid: true };
  },
  message(_, { result }) {
    return `Your password is ${result?.value.toLocaleLowerCase()}`;
  },
  tooltip(_, { result, $dirty }) {
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

export const { useRegle: useCustomRegle } = defineRegleConfig({
  rules: () => ({
    required: withMessage(required, 'You need to provide a value'),
    checkPseudo,
    strongPassword,
  }),
  shortcuts: {
    fields: {
      $isRequired: (field) => field.$rules.required?.$active ?? false,
    },
    nested: {
      $isEmpty: (nest) => false,
    },
  },
});
