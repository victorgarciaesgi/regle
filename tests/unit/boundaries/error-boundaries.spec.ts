import { createRule, useRegle, type Maybe } from '@regle/core';
import { applyIf } from '@regle/rules';
import { createRegleComponent } from '../../utils/test.utils';

function simpleNestedStateWithMixedValidation() {
  interface Form {
    email?: string;
  }

  const triggerError = null as unknown as { nested: { name: boolean } };

  const customErroredRule = createRule({
    validator(_value: Maybe<unknown>) {
      return triggerError.nested.name;
    },
    message() {
      return triggerError.nested.name ? '' : '';
    },
    active() {
      return triggerError.nested.name;
    },
  });

  return useRegle({} as Form, {
    email: { customErroredRule, rule: applyIf(() => triggerError.nested.name, customErroredRule) },
  });
}

describe('$validate', () => {
  it('should not crash when an error is thrown into validators', async () => {
    const { vm } = createRegleComponent(simpleNestedStateWithMixedValidation);

    expect(async () => await vm.r$.$validate()).not.toThrow();

    expect(vm.r$).toBeDefined();
  });
});
