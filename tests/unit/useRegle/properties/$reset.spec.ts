import { nextTick } from 'vue';
import {
  simpleNestedStateWithComputedValidation,
  simpleNestedStateWithMixedValidation,
} from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBeInvalidField } from '../../../utils/validations.utils';
import { flushPromises } from '@vue/test-utils';

describe('.$reset', () => {
  it('should update the $dirty state to false', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

    shouldBeInvalidField(vm.r$.$fields.email);

    vm.r$.$fields.email.$touch();
    await nextTick();

    shouldBeErrorField(vm.r$.$fields.email);

    vm.r$.$fields.email.$reset();

    shouldBeInvalidField(vm.r$.$fields.email);
  });

  it('should update the $dirty state to false, only on the current property', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

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
    const { vm } = await createRegleComponent(simpleNestedStateWithComputedValidation);

    expect(vm.r$.$fields.user.$fields.firstName).toBe(undefined);
    expect(vm.r$.$fields.user.$fields.lastName).toBe(undefined);

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

    expect(vm.r$.$fields.user.$fields.firstName).toBe(undefined);
    expect(vm.r$.$fields.user.$fields.lastName).toBe(undefined);

    vm.r$.$value.userRequired = true;
    await vm.$nextTick();

    shouldBeErrorField(vm.r$.$fields.user.$fields.firstName);
    shouldBeErrorField(vm.r$.$fields.user.$fields.lastName);

    await Promise.all([vm.r$.$fields.user.$reset(), flushPromises()]);

    shouldBeInvalidField(vm.r$.$fields.user.$fields.firstName);
    shouldBeInvalidField(vm.r$.$fields.user.$fields.lastName);
  });
});
