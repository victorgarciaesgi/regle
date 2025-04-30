import { nextTick, ref } from 'vue';
import {
  simpleNestedStateWithMixedValidation,
  simpleNestedStateWithMixedValidationAndGlobalConfig,
} from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
import {
  shouldBeErrorField,
  shouldBeInvalidField,
  shouldBePristineField,
  shouldBeUnRuledCorrectField,
  shouldBeValidField,
} from '../../../utils/validations.utils';
import { useRegle } from '@regle/core';
import { required, withParams } from '@regle/rules';

describe.each([
  ['local modifier', () => simpleNestedStateWithMixedValidation({ autoDirty: false })],
  ['global modifier', () => simpleNestedStateWithMixedValidationAndGlobalConfig({ autoDirty: false })],
])('$autoDirty -> false - %s', (name, rules) => {
  it('should not update the $dirty state to true when value changes before first validation', async () => {
    const { vm } = await createRegleComponent(rules);

    shouldBeInvalidField(vm.r$.$fields.email);
    shouldBeInvalidField(vm.r$.$fields.user.$fields.firstName);
    shouldBeInvalidField(vm.r$.$fields.user.$fields.lastName);
    shouldBeInvalidField(vm.r$.$fields.contacts.$each[0]);

    vm.r$.$value.email = 'foo';
    await nextTick();
    shouldBeInvalidField(vm.r$.$fields.email);

    vm.r$.$validate();
    await nextTick();
    shouldBeErrorField(vm.r$.$fields.email);

    vm.r$.$value.email = 'foo@gmail.com';
    await nextTick();
    shouldBeValidField(vm.r$.$fields.email);

    vm.r$.$value.email = 'foo';
    await nextTick();
    shouldBeErrorField(vm.r$.$fields.email);
  });

  it('should not update the `$dirty` state to `true`, even after `$reset`', async () => {
    const { vm } = await createRegleComponent(rules);

    vm.r$.$value.email = 'foo';
    await nextTick();
    shouldBeInvalidField(vm.r$.$fields.email);

    vm.r$.$reset();
    expect(vm.r$.$fields.email.$dirty).toBe(false);

    vm.r$.$value.email = 'bar';
    await nextTick();
    shouldBeInvalidField(vm.r$.$fields.email);

    vm.r$.$validate();
    await nextTick();

    shouldBeErrorField(vm.r$.$fields.email);

    vm.r$.$value.email = 'bar@free.fr';
    await nextTick();
    shouldBeValidField(vm.r$.$fields.email);
  });
});
