import { createRule, defineRegleConfig, type Maybe } from '@regle/core';
import { defineRegleNuxtPlugin } from '@regle/nuxt/setup';
import { isFilled, required, withMessage } from '@regle/rules';
import { passwordStrength, type DiversityType, type Options } from 'check-password-strength';

function timeout(count: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, count);
  });
}

const diversityTypes: DiversityType[] = ['lowercase', 'uppercase', 'symbol', 'number'];
const diversityMessages: Record<DiversityType, string> = {
  lowercase: 'At least one lowercase letter (a-z)',
  uppercase: 'At least one uppercase letter (A-Z)',
  number: 'At least one number (0-9)',
  symbol: 'At least one symbol ($€@&..)',
};

function randomBoolean(): boolean {
  return [1, 2][Math.floor(Math.random() * 2)] === 1 ? true : false;
}

export const checkPseudo = createRule({
  async validator(value: Maybe<string>) {
    if (isFilled(value)) {
      await timeout(2000);
      return randomBoolean();
    }
    return true;
  },
  message: 'The pseudo is already taken',
});

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

export const regleConfig = defineRegleConfig({
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
      $isEmpty: (_nest) => false,
    },
  },
});

export default defineRegleNuxtPlugin(() => regleConfig);
