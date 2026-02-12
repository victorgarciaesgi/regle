import { defineRegleConfig } from '@regle/core';
import { required, withMessage } from '@regle/rules';

export const { useRegle: useCustomRegle } = defineRegleConfig({
  rules: () => ({
    myCustomRule: withMessage(required, ''),
  }),
  shortcuts: {
    fields: {
      $test: () => true,
      $isRequired: (field) => field.$rules.required?.$active ?? false,
    },
  },
});
