import { defineRegleConfig } from '@regle/core';
import { withMessage } from '@regle/rules';

export const { useRegle: useCustomRegle } = defineRegleConfig({
  rules: () => ({
    myCustomRule: withMessage(() => true, ''),
  }),
  shortcuts: {
    fields: {
      $test: () => true,
      $isRequired: (field) => field.$rules.required?.$active ?? false,
    },
  },
});
