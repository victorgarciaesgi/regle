import { defineRegleConfig } from '@regle/core';
import { required, withMessage } from '@regle/rules';
import { checkPseudo } from './custom-rules/check-pseudo.rule';
import { strongPassword } from './custom-rules/strong-password.rule';

export const { useRegle: useCustomRegle } = defineRegleConfig({
  rules: () => ({
    /** Customizing default message */
    required: withMessage(required, 'You need to provide a value'),
    /** Registering custom rules */
    checkPseudo,
    strongPassword,
  }),
  /** Registering custom properties */
  shortcuts: {
    fields: {
      $isRequired: (field) => field.$rules.required?.$active ?? false,
    },
    nested: {
      $isEmpty: (nest) => Object.keys(nest.$fields).length === 0,
    },
  },
});
