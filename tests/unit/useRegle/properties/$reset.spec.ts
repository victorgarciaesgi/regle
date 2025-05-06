import { nextTick } from 'vue';
import { simpleNestedStateWithComputedValidation, simpleNestedStateWithMixedValidation } from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
import {
  shouldBeErrorField,
  shouldBeInvalidField,
  shouldBePristineField,
  shouldBeValidField,
} from '../../../utils/validations.utils';
import { flushPromises } from '@vue/test-utils';

describe('.$reset', () => {
  it('should update the $dirty state to false', async () => {
    const { vm } = createRegleComponent(simpleNestedStateWithMixedValidation);

    shouldBeInvalidField(vm.r$.$fields.email);

    vm.r$.$fields.email.$validate();
    await nextTick();

    shouldBeErrorField(vm.r$.$fields.email);

    vm.r$.$fields.email.$reset();

    shouldBeInvalidField(vm.r$.$fields.email);

    vm.r$.$value.email = 'foo@free.fr';
    await nextTick();

    shouldBeValidField(vm.r$.$fields.email);

    vm.r$.$fields.email.$reset();
    await nextTick();

    shouldBePristineField(vm.r$.$fields.email);
  });

  it('should update the $dirty state to false, only on the current property', async () => {
    const { vm } = createRegleComponent(simpleNestedStateWithMixedValidation);

    shouldBeInvalidField(vm.r$.$fields.user.$fields.firstName);
    shouldBeInvalidField(vm.r$.$fields.user.$fields.lastName);

    vm.r$.$fields.user.$fields.firstName.$touch();
    vm.r$.$fields.user.$fields.lastName.$touch();

    await nextTick();

    shouldBeErrorField(vm.r$.$fields.user.$fields.firstName);
    shouldBeErrorField(vm.r$.$fields.user.$fields.lastName);

    vm.r$.$fields.user.$fields.firstName.$reset();

    shouldBeInvalidField(vm.r$.$fields.user.$fields.firstName);
    shouldBeErrorField(vm.r$.$fields.user.$fields.lastName);
  });

  it('should reset even after coming back from cache', async () => {
    const { vm } = createRegleComponent(simpleNestedStateWithComputedValidation);

    expect(vm.r$.$fields.user.$fields.firstName).toBeDefined();
    expect(vm.r$.$fields.user.$fields.lastName).toBeDefined();

    vm.r$.$value.userRequired = true;
    await vm.$nextTick();

    expect(vm.r$.$fields.user.$fields.firstName?.$dirty).toBe(false);
    expect(vm.r$.$fields.user.$fields.lastName?.$dirty).toBe(false);

    vm.r$.$fields.user.$fields.firstName?.$touch();
    vm.r$.$fields.user.$fields.lastName?.$touch();
    await vm.$nextTick();

    shouldBeErrorField(vm.r$.$fields.user.$fields.firstName);
    shouldBeErrorField(vm.r$.$fields.user.$fields.lastName);

    vm.r$.$value.userRequired = false;
    await vm.$nextTick();

    expect(vm.r$.$fields.user.$fields.firstName).toBeDefined();
    expect(vm.r$.$fields.user.$fields.lastName).toBeDefined();

    vm.r$.$value.userRequired = true;
    await vm.$nextTick();

    shouldBeErrorField(vm.r$.$fields.user.$fields.firstName);
    shouldBeErrorField(vm.r$.$fields.user.$fields.lastName);

    await Promise.all([vm.r$.$fields.user.$reset(), flushPromises()]);

    shouldBeInvalidField(vm.r$.$fields.user.$fields.firstName);
    shouldBeInvalidField(vm.r$.$fields.user.$fields.lastName);
  });

  it('should reset correctly all values inside a nested tree', async () => {
    const { vm } = createRegleComponent(simpleNestedStateWithComputedValidation);

    await nextTick();

    vm.r$.$validate();
    await nextTick();

    shouldBeErrorField(vm.r$);

    vm.r$.$reset();
    await nextTick();

    shouldBeInvalidField(vm.r$);

    vm.r$.$value = {
      nested: {
        collection: [{ name: 'eee' }],
      },
      contacts: [{ name: 'eee' }],
      email: 'eee@free.fr',
      user: { firstName: 'eee', lastName: 'eee' },
      userRequired: true,
    };

    await nextTick();

    expect(vm.r$.$fields.email.$dirty).toBe(true);
    expect(vm.r$.$fields.contacts.$each[0].$dirty).toBe(true);

    shouldBeValidField(vm.r$.$fields.contacts);
    shouldBeValidField(vm.r$);

    vm.r$.$reset();
    await nextTick();

    shouldBePristineField(vm.r$);

    vm.r$.$reset({ toInitialState: true });
    await nextTick();

    // Check if $reset updated the initialState
    expect(vm.r$.$value).toStrictEqual({
      nested: {
        collection: [{ name: 'eee' }],
      },
      contacts: [{ name: 'eee' }],
      email: 'eee@free.fr',
      user: { firstName: 'eee', lastName: 'eee' },
      userRequired: true,
    });
  });
});
