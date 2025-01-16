import { createRule, defineRegleConfig, useRegle } from '@regle/core';
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

  const createRuleOneError = createRule({ validator: () => false, message: 'Error 3' });
  const createRuleMultipleError = createRule({
    validator: () => false,
    message: ['Error 3.1', 'Error 3.2', 'Error 3.3'],
  });
  const createRuleFunctionOneError = createRule({ validator: () => false, message: () => 'Error 4' });
  const createRuleFunctionMultipleError = createRule({ validator: () => false, message: () => ['Error 4.1'] });

  const allValidators = {
    ruleWithOneError,
    ruleWithMultipleErrors,
    ruleFunctionWithOneError,
    ruleFunctionWithMultipleError,
    createRuleOneError,
    createRuleMultipleError,
    createRuleFunctionOneError,
    createRuleFunctionMultipleError,
  };

  const form = ref({
    email: '',
    user: {
      firstName: '',
      nested: {
        child: '',
        collection: [{ name: '' }],
      },
    },
    contacts: [{ name: '' }],
  });

  return useRegle(form, {
    email: allValidators,
    user: {
      firstName: allValidators,
      nested: {
        child: allValidators,
        collection: {
          ...allValidators,
          $each: {
            name: allValidators,
          },
        },
      },
    },
    contacts: {
      $each: {
        name: allValidators,
      },
    },
  });
}

describe('errors', () => {
  it('should report any error format for rules', async () => {
    const { vm } = createRegleComponent(errorsRules);

    vm.r$.$touch();
    await vm.$nextTick();

    const expectedErrors = [
      'Error',
      'Error 1.1',
      'Error 1.2',
      'Error 2',
      'Error 2.1',
      'Error 2.2',
      'Error 3',
      'Error 3.1',
      'Error 3.2',
      'Error 3.3',
      'Error 4',
      'Error 4.1',
    ];

    expect(vm.r$.$fields.email.$errors).toStrictEqual(expectedErrors);
    expect(vm.r$.$fields.user.$fields.firstName.$errors).toStrictEqual(expectedErrors);
    expect(vm.r$.$fields.user.$fields.nested.$fields.child.$errors).toStrictEqual(expectedErrors);
    expect(vm.r$.$fields.user.$fields.nested.$fields.collection.$self.$errors).toStrictEqual(expectedErrors);
    expect(vm.r$.$fields.user.$fields.nested.$fields.collection.$errors.$self).toStrictEqual(expectedErrors);
    expect(vm.r$.$fields.user.$fields.nested.$fields.collection.$each[0].$fields.name.$errors).toStrictEqual(
      expectedErrors
    );
    expect(vm.r$.$fields.contacts.$each[0].$fields.name.$errors).toStrictEqual(expectedErrors);

    vm.r$.$value.contacts.push({ name: '' });
    await vm.$nextTick();
    vm.r$.$touch();
    await vm.$nextTick();

    expect(vm.r$.$fields.contacts.$each[1].$fields.name.$errors).toStrictEqual(expectedErrors);
  });
});
