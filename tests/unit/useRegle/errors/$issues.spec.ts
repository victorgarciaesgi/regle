import { createRule, defineRegleConfig, useRegle, type RegleFieldIssue } from '@regle/core';
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
    type: 'modifiedType',
    validator: () => {
      return {
        $valid: false,
        foobar: 'hello',
      };
    },
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

    const expectedIssues = [
      { $message: 'Error', $rule: 'ruleWithOneError', $type: '__inline' },
      { $message: 'Error 1.1', $rule: 'ruleWithMultipleErrors', $type: '__inline' },
      { $message: 'Error 1.2', $rule: 'ruleWithMultipleErrors', $type: '__inline' },
      { $message: 'Error 2', $rule: 'ruleFunctionWithOneError', $type: '__inline' },
      { $message: 'Error 2.1', $rule: 'ruleFunctionWithMultipleError', $type: '__inline' },
      { $message: 'Error 2.2', $rule: 'ruleFunctionWithMultipleError', $type: '__inline' },
      { $message: 'Error 3', $rule: 'createRuleOneError', $type: 'createRuleOneError' },
      { $message: 'Error 3.1', $rule: 'createRuleMultipleError', $type: 'modifiedType', foobar: 'hello' },
      { $message: 'Error 3.2', $rule: 'createRuleMultipleError', $type: 'modifiedType', foobar: 'hello' },
      { $message: 'Error 3.3', $rule: 'createRuleMultipleError', $type: 'modifiedType', foobar: 'hello' },
      { $message: 'Error 4', $rule: 'createRuleFunctionOneError', $type: 'createRuleFunctionOneError' },
      { $message: 'Error 4.1', $rule: 'createRuleFunctionMultipleError', $type: 'createRuleFunctionMultipleError' },
    ];

    expect(vm.r$.email.$rules.createRuleMultipleError.$metadata.foobar).toBe('hello');

    vm.r$.email.$issues.map((issue) => {
      if (issue.$rule === 'createRuleMultipleError') {
        expect(issue.foobar).toBe('hello');
        expectTypeOf(issue.foobar).toBeString();
      }
    });

    expect(vm.r$.email.$issues).toStrictEqual(
      expectedIssues.map((issue) => ({ $property: 'email', ...issue }) satisfies RegleFieldIssue)
    );
    expect(vm.r$.$issues.email).toStrictEqual(
      expectedIssues.map((issue) => ({ $property: 'email', ...issue }) satisfies RegleFieldIssue)
    );
    expect(vm.r$.user.firstName.$issues).toStrictEqual(
      expectedIssues.map((issue) => ({ $property: 'firstName', ...issue }) satisfies RegleFieldIssue)
    );
    expect(vm.r$.user.nested.child.$issues).toStrictEqual(
      expectedIssues.map((issue) => ({ $property: 'child', ...issue }) satisfies RegleFieldIssue)
    );
    expect(vm.r$.user.nested.collection.$self.$issues).toStrictEqual(
      expectedIssues.map((issue) => ({ $property: 'collection', ...issue }) satisfies RegleFieldIssue)
    );
    expect(vm.r$.user.nested.collection.$each[0].name.$issues).toStrictEqual(
      expectedIssues.map((issue) => ({ $property: 'name', ...issue }) satisfies RegleFieldIssue)
    );
    expect(vm.r$.contacts.$each[0].name.$issues).toStrictEqual(
      expectedIssues.map((issue) => ({ $property: 'name', ...issue }) satisfies RegleFieldIssue)
    );

    expect(vm.r$.$issues.contacts.$each[0].name).toStrictEqual(
      expectedIssues.map((issue) => ({ $property: 'name', ...issue }) satisfies RegleFieldIssue)
    );

    vm.r$.$value.contacts.push({ name: '' });
    await vm.$nextTick();
    vm.r$.$touch();
    await vm.$nextTick();

    expect(vm.r$.contacts.$each[1].name.$issues).toStrictEqual(
      expectedIssues.map((issue) => ({ $property: 'name', ...issue }) satisfies RegleFieldIssue)
    );
  });
});
