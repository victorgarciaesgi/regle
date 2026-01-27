import { nextTick } from 'vue';
import {
  simpleNestedStateWithMixedValidation,
  simpleNestedStateWithMixedValidationAndGlobalConfig,
} from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBeInvalidField, shouldBeValidField } from '../../../utils/validations.utils';
import { useRegle } from '@regle/core';
import { required, email } from '@regle/rules';
import { ref } from 'vue';

describe.each([
  ['local modifier', () => simpleNestedStateWithMixedValidation({ immediateDirty: true })],
  ['global modifier', () => simpleNestedStateWithMixedValidationAndGlobalConfig({ immediateDirty: true })],
])('$immediateDirty -> true - %s', (name, rules) => {
  it('should set the $dirty state to true when form is initialized', async () => {
    const { vm } = await createRegleComponent(rules);

    expect(vm.r$.email.$dirty).toBe(true);
    expect(vm.r$.$dirty).toBe(true);
    expect(vm.r$.$anyDirty).toBe(true);
    expect(vm.r$.user.firstName.$dirty).toBe(true);
    expect(vm.r$.user.lastName.$dirty).toBe(true);
    expect(vm.r$.contacts.$each[0].name.$dirty).toBe(true);
  });

  it('should show errors immediately when fields are invalid', async () => {
    const { vm } = await createRegleComponent(rules);

    shouldBeErrorField(vm.r$.email);
    shouldBeErrorField(vm.r$.user.firstName);
    shouldBeErrorField(vm.r$.user.lastName);
    shouldBeErrorField(vm.r$.contacts.$each[0]);
  });

  it('should remain dirty after $reset', async () => {
    const { vm } = await createRegleComponent(rules);

    vm.r$.$value.email = 'test@example.com';
    await nextTick();
    shouldBeValidField(vm.r$.email);

    vm.r$.$reset();
    await nextTick();

    expect(vm.r$.email.$dirty).toBe(true);
    expect(vm.r$.$dirty).toBe(true);
    expect(vm.r$.$anyDirty).toBe(true);
  });
});

describe.each([
  ['local modifier', () => simpleNestedStateWithMixedValidation({ immediateDirty: false })],
  ['global modifier', () => simpleNestedStateWithMixedValidationAndGlobalConfig({ immediateDirty: false })],
])('$immediateDirty -> false - %s', (name, rules) => {
  it('should not set the $dirty state to true when form is initialized', async () => {
    const { vm } = createRegleComponent(rules);

    expect(vm.r$.email.$dirty).toBe(false);
    expect(vm.r$.$dirty).toBe(false);
    expect(vm.r$.$anyDirty).toBe(false);
    expect(vm.r$.user.firstName.$dirty).toBe(false);
    expect(vm.r$.user.lastName.$dirty).toBe(false);
    expect(vm.r$.contacts.$each[0].name.$dirty).toBe(false);
  });

  it('should not show errors until field becomes dirty', async () => {
    const { vm } = createRegleComponent(rules);

    // Fields should be invalid but not showing errors (not dirty)
    shouldBeInvalidField(vm.r$.email);
    shouldBeInvalidField(vm.r$.user.firstName);
    shouldBeInvalidField(vm.r$.user.lastName);
    shouldBeInvalidField(vm.r$.contacts.$each[0]);

    // After changing value, field should become dirty and show errors
    vm.r$.$value.email = 'invalid';
    await nextTick();
    shouldBeErrorField(vm.r$.email);
  });
});

describe('$immediateDirty default behavior', () => {
  it('should default to false when not specified', async () => {
    const form = ref({
      email: '',
    });

    const { vm } = createRegleComponent(() =>
      useRegle(
        form,
        {
          email: { required, email },
        },
        {}
      )
    );

    expect(vm.r$.email.$dirty).toBe(false);
    expect(vm.r$.$dirty).toBe(false);
    expect(vm.r$.$anyDirty).toBe(false);
  });

  it('should work as field-level modifier', async () => {
    const form = ref({
      email: '',
      name: '',
    });

    const { vm } = createRegleComponent(() =>
      useRegle(
        form,
        {
          email: { required, email, $immediateDirty: true },
          name: { required },
        },
        {}
      )
    );

    expect(vm.r$.email.$dirty).toBe(true);
    shouldBeErrorField(vm.r$.email);

    expect(vm.r$.name.$dirty).toBe(false);
    shouldBeInvalidField(vm.r$.name);
  });
});
