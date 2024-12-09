import { defineRegleConfig, useRegle } from '@regle/core';
import { withMessage } from '@regle/rules';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';

function errorsRules() {
  const ruleWithOneError = withMessage(() => false, 'Error');
  const ruleWithMultipleErrors = withMessage(() => false, ['Error 1.1', 'Error 1.2']);
  const ruleFunctionWithOneError = withMessage(
    () => false,
    () => 'Error 2'
  );
  const ruleFunctionWithMultipleError = withMessage(
    () => false,
    () => ['Error 2.1', 'Error 2.2']
  );

  const form = ref({
    email: '',
    user: {
      firstName: '',
    },
    contacts: [{ name: '' }],
  });

  return useRegle(form, {
    email: { ruleWithOneError, ruleWithMultipleErrors, ruleFunctionWithOneError, ruleFunctionWithMultipleError },
    user: {
      firstName: { ruleWithOneError, ruleWithMultipleErrors, ruleFunctionWithOneError, ruleFunctionWithMultipleError },
    },
    contacts: {
      $each: {
        name: { ruleWithOneError, ruleWithMultipleErrors, ruleFunctionWithOneError, ruleFunctionWithMultipleError },
      },
    },
  });
}

describe('errors', () => {
  it('should report any error format for rules', async () => {
    const { vm } = createRegleComponent(errorsRules);

    vm.r$.$touch();
    await vm.$nextTick();

    const expectedErrors = ['Error', 'Error 1.1', 'Error 1.2', 'Error 2', 'Error 2.1', 'Error 2.2'];

    expect(vm.r$.$fields.email.$errors).toStrictEqual(expectedErrors);
    expect(vm.r$.$fields.user.$fields.firstName.$errors).toStrictEqual(expectedErrors);
    expect(vm.r$.$fields.contacts.$each[0].$fields.name.$errors).toStrictEqual(expectedErrors);
  });
});
