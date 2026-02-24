import { createRule, defineRegleConfig } from '@regle/core';
import { required, withMessage } from '@regle/rules';

export const customRuleWithParams = createRule({
  validator: (_value: unknown, _param1?: boolean) => {
    return true;
  },
  message: 'Custom rule',
});

export const { useRegle: useCustomRegle } = defineRegleConfig({
  rules: () => ({
    myCustomRule: withMessage(required, ''),
    customRuleWithParams,
  }),
  shortcuts: {
    fields: {
      $test: () => true,
      $isRequired: (field) => field.$rules.required?.$active ?? false,
    },
  },
});
