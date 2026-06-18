import { nextTick } from 'vue';
import {
  simpleNestedStateWithMixedValidation,
  simpleNestedStateWithMixedValidationAndGlobalConfig,
} from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBeInvalidField, shouldBeValidField } from '../../../utils/validations.utils';
import { useRegle, type RegleBehaviourOptions } from '@regle/core';
import { required, email } from '@regle/rules';
import { ref } from 'vue';

type ImmediateDirtyOption = NonNullable<RegleBehaviourOptions['immediateDirty']>;

function nestedFormWithInitialValues(immediateDirty: ImmediateDirtyOption) {
  const form = ref({
    email: 'test@example.com',
    user: {
      firstName: '',
      lastName: 'Doe',
    },
    contacts: [{ name: '' }, { name: 'Jane' }],
  });

  return useRegle(
    form,
    {
      email: { required, email },
      user: {
        firstName: { required },
        lastName: { required },
      },
      contacts: {
        $each: {
          name: { required },
        },
      },
    },
    { immediateDirty }
  );
}

function emptyNestedForm(immediateDirty: ImmediateDirtyOption) {
  const form = ref({
    email: '',
    user: {
      firstName: '',
      lastName: '',
    },
    contacts: [{ name: '' }],
  });

  return useRegle(
    form,
    {
      email: { required, email },
      user: {
        firstName: { required },
        lastName: { required },
      },
      contacts: {
        $each: {
          name: { required },
        },
      },
    },
    { immediateDirty }
  );
}

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

describe('$immediateDirty string modes', () => {
  it('keeps current eager behavior', async () => {
    const { vm } = await createRegleComponent(() => nestedFormWithInitialValues('eager'));

    expect(vm.r$.email.$dirty).toBe(true);
    expect(vm.r$.$dirty).toBe(true);
    expect(vm.r$.$anyDirty).toBe(true);
    expect(vm.r$.user.firstName.$dirty).toBe(true);
    expect(vm.r$.user.lastName.$dirty).toBe(true);
    expect(vm.r$.contacts.$each[0].name.$dirty).toBe(true);
    expect(vm.r$.contacts.$each[1].name.$dirty).toBe(true);
  });

  it('touches the whole form when non-empty mode finds any initial value', async () => {
    const { vm } = await createRegleComponent(() => nestedFormWithInitialValues('non-empty'));

    expect(vm.r$.email.$dirty).toBe(true);
    expect(vm.r$.$dirty).toBe(true);
    expect(vm.r$.$anyDirty).toBe(true);
    expect(vm.r$.user.firstName.$dirty).toBe(true);
    expect(vm.r$.user.lastName.$dirty).toBe(true);
    expect(vm.r$.contacts.$each[0].name.$dirty).toBe(true);
    expect(vm.r$.contacts.$each[1].name.$dirty).toBe(true);
  });

  it('re-applies non-empty mode after reset', async () => {
    const { vm } = await createRegleComponent(() => nestedFormWithInitialValues('non-empty'));

    vm.r$.$reset();
    await nextTick();

    expect(vm.r$.email.$dirty).toBe(true);
    expect(vm.r$.$dirty).toBe(true);
    expect(vm.r$.$anyDirty).toBe(true);
    expect(vm.r$.user.firstName.$dirty).toBe(true);
    expect(vm.r$.user.lastName.$dirty).toBe(true);
    expect(vm.r$.contacts.$each[0].name.$dirty).toBe(true);
    expect(vm.r$.contacts.$each[1].name.$dirty).toBe(true);
  });

  it('does not touch the form when non-empty mode only sees empty initial values', async () => {
    const { vm } = await createRegleComponent(() => emptyNestedForm('non-empty'));

    expect(vm.r$.email.$dirty).toBe(false);
    expect(vm.r$.$dirty).toBe(false);
    expect(vm.r$.$anyDirty).toBe(false);
    expect(vm.r$.user.firstName.$dirty).toBe(false);
    expect(vm.r$.user.lastName.$dirty).toBe(false);
    expect(vm.r$.contacts.$each[0].name.$dirty).toBe(false);
  });

  it('touches only non-empty initial fields in lazy non-empty mode', async () => {
    const { vm } = await createRegleComponent(() => nestedFormWithInitialValues('lazy-non-empty'));

    expect(vm.r$.email.$dirty).toBe(true);
    expect(vm.r$.$dirty).toBe(false);
    expect(vm.r$.$anyDirty).toBe(true);
    expect(vm.r$.user.$dirty).toBe(false);
    expect(vm.r$.user.$anyDirty).toBe(true);
    expect(vm.r$.user.firstName.$dirty).toBe(false);
    expect(vm.r$.user.lastName.$dirty).toBe(true);
    expect(vm.r$.contacts.$each[0].name.$dirty).toBe(false);
    expect(vm.r$.contacts.$each[1].name.$dirty).toBe(true);
  });

  it('does not touch the form when only inactive fields have non-empty initial values', async () => {
    const form = ref({
      email: '',
      notes: 'prefilled',
    });

    const { vm } = createRegleComponent(() =>
      useRegle(
        form,
        {
          email: { required, email },
        },
        { immediateDirty: 'non-empty' }
      )
    );

    expect(vm.r$.email.$dirty).toBe(false);
    expect(vm.r$.notes.$dirty).toBe(false);
    expect(vm.r$.notes.$inactive).toBe(true);
    expect(vm.r$.$dirty).toBe(false);
    expect(vm.r$.$anyDirty).toBe(false);
    shouldBeInvalidField(vm.r$.email);
    expect(vm.r$.notes.$invalid).toBe(false);
  });

  it('touches a root field when non-empty mode finds an initial value', async () => {
    const form = ref('test@example.com');

    const { vm } = createRegleComponent(() => useRegle(form, { required, email }, { immediateDirty: 'non-empty' }));

    expect(vm.r$.$dirty).toBe(true);
    expect(vm.r$.$anyDirty).toBe(true);
    shouldBeValidField(vm.r$);
  });

  it('does not touch an empty root field in non-empty mode', async () => {
    const form = ref('');

    const { vm } = createRegleComponent(() => useRegle(form, { required }, { immediateDirty: 'non-empty' }));

    expect(vm.r$.$dirty).toBe(false);
    expect(vm.r$.$anyDirty).toBe(false);
    shouldBeInvalidField(vm.r$);
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

  it('should work as field-level lazy non-empty modifier', async () => {
    const form = ref({
      email: 'test@example.com',
      name: '',
    });

    const { vm } = createRegleComponent(() =>
      useRegle(
        form,
        {
          email: { required, email, $immediateDirty: 'lazy-non-empty' },
          name: { required, $immediateDirty: 'lazy-non-empty' },
        },
        {}
      )
    );

    expect(vm.r$.email.$dirty).toBe(true);
    shouldBeValidField(vm.r$.email);

    expect(vm.r$.name.$dirty).toBe(false);
    shouldBeInvalidField(vm.r$.name);
  });
});
