import { nextTick } from 'vue';
import {
  simpleNestedStateWithMixedValidation,
  simpleNestedStateWithMixedValidationAndGlobalConfig,
} from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
import {
  shouldBeErrorField,
  shouldBeInvalidField,
  shouldBePristineField,
  shouldBeValidField,
} from '../../../utils/validations.utils';
import { useRegle } from '@regle/core';

describe.each([
  ['local modifier', () => simpleNestedStateWithMixedValidation({ autoDirty: false })],
  ['global modifier', () => simpleNestedStateWithMixedValidationAndGlobalConfig({ autoDirty: false })],
])('$autoDirty -> false - %s', (name, rules) => {
  it('should not update the $dirty state to true when value changes before first validation', async () => {
    const { vm } = await createRegleComponent(rules);

    shouldBeInvalidField(vm.r$.email);
    shouldBeInvalidField(vm.r$.user.firstName);
    shouldBeInvalidField(vm.r$.user.lastName);
    shouldBeInvalidField(vm.r$.contacts.$each[0]);

    vm.r$.$value.email = 'foo';
    await nextTick();
    shouldBeInvalidField(vm.r$.email);

    vm.r$.$validate();
    await nextTick();
    shouldBeErrorField(vm.r$.email);

    vm.r$.$value.email = 'foo@gmail.com';
    await nextTick();
    shouldBeValidField(vm.r$.email);

    vm.r$.$value.email = 'foo';
    await nextTick();
    shouldBeErrorField(vm.r$.email);
  });

  it('should not update the `$dirty` state to `true`, even after `$reset`', async () => {
    const { vm } = await createRegleComponent(rules);

    vm.r$.$value.email = 'foo';
    await nextTick();
    shouldBeInvalidField(vm.r$.email);

    vm.r$.$reset();
    expect(vm.r$.email.$dirty).toBe(false);

    vm.r$.$value.email = 'bar';
    await nextTick();
    shouldBeInvalidField(vm.r$.email);

    vm.r$.$validate();
    await nextTick();

    shouldBeErrorField(vm.r$.email);

    vm.r$.$value.email = 'bar@free.fr';
    await nextTick();
    shouldBeValidField(vm.r$.email);
  });
});

describe('$autoDirty default', () => {
  function defaultDataRegle() {
    return useRegle({} as { firstName?: string }, {}, { autoDirty: false });
  }

  it('should correctly define new $fields from data when autoDirty is false', async () => {
    const { vm } = createRegleComponent(defaultDataRegle);

    expect(vm.r$.$fields).toStrictEqual({});

    vm.r$.$value = { firstName: 'foo' };
    await vm.$nextTick();

    shouldBePristineField(vm.r$.firstName);
  });
});
