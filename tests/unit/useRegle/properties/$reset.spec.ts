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

    shouldBeInvalidField(vm.r$.email);

    vm.r$.email.$validate();
    await nextTick();

    shouldBeErrorField(vm.r$.email);

    vm.r$.email.$reset();

    shouldBeInvalidField(vm.r$.email);

    vm.r$.$value.email = 'foo@free.fr';
    await nextTick();

    shouldBeValidField(vm.r$.email);

    vm.r$.email.$reset();
    await nextTick();

    shouldBePristineField(vm.r$.email);
  });

  it('should update the $dirty state to false, only on the current property', async () => {
    const { vm } = createRegleComponent(simpleNestedStateWithMixedValidation);

    shouldBeInvalidField(vm.r$.user.firstName);
    shouldBeInvalidField(vm.r$.user.lastName);

    vm.r$.user.firstName.$touch();
    vm.r$.user.lastName.$touch();

    await nextTick();

    shouldBeErrorField(vm.r$.user.firstName);
    shouldBeErrorField(vm.r$.user.lastName);

    vm.r$.user.firstName.$reset();

    shouldBeInvalidField(vm.r$.user.firstName);
    shouldBeErrorField(vm.r$.user.lastName);
  });

  it('should reset even after coming back from cache', async () => {
    const { vm } = createRegleComponent(simpleNestedStateWithComputedValidation);

    expect(vm.r$.user.firstName).toBeDefined();
    expect(vm.r$.user.lastName).toBeDefined();

    vm.r$.$value.userRequired = true;
    await vm.$nextTick();

    expect(vm.r$.user.firstName?.$dirty).toBe(false);
    expect(vm.r$.user.lastName?.$dirty).toBe(false);

    vm.r$.user.firstName?.$touch();
    vm.r$.user.lastName?.$touch();
    await vm.$nextTick();

    shouldBeErrorField(vm.r$.user.firstName);
    shouldBeErrorField(vm.r$.user.lastName);

    vm.r$.$value.userRequired = false;
    await vm.$nextTick();

    expect(vm.r$.user.firstName).toBeDefined();
    expect(vm.r$.user.lastName).toBeDefined();

    vm.r$.$value.userRequired = true;
    await vm.$nextTick();

    shouldBeErrorField(vm.r$.user.firstName);
    shouldBeErrorField(vm.r$.user.lastName);

    await Promise.all([vm.r$.user.$reset(), flushPromises()]);

    shouldBeInvalidField(vm.r$.user.firstName);
    shouldBeInvalidField(vm.r$.user.lastName);
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

    expect(vm.r$.email.$dirty).toBe(true);
    expect(vm.r$.contacts.$each[0].$dirty).toBe(true);

    shouldBeValidField(vm.r$.contacts);
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

    vm.r$.$reset({ toOriginalState: true });
    await nextTick();

    shouldBeInvalidField(vm.r$);

    expect(vm.r$.$value).toStrictEqual({
      nested: {
        collection: [{ name: '' }],
      },
      contacts: [],
      email: '',
      user: { firstName: '', lastName: '' },
      userRequired: false,
    });
  });
});
