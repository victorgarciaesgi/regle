import { nextTick } from 'vue';
import {
  simpleNestedStateWithComputedValidation,
  simpleNestedStateWithMixedValidation,
} from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBeInvalidField } from '../../../utils/validations.utils';

describe('.$reset', () => {
  it('should update the $dirty state to false', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

    shouldBeInvalidField(vm.regle.$fields.email);

    vm.regle.$fields.email.$touch();
    await nextTick();

    shouldBeErrorField(vm.regle.$fields.email);

    vm.regle.$fields.email.$reset();

    shouldBeInvalidField(vm.regle.$fields.email);
  });

  it('should update the $dirty state to false, only on the current property', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

    shouldBeInvalidField(vm.regle.$fields.user.$fields.firstName);
    shouldBeInvalidField(vm.regle.$fields.user.$fields.lastName);

    vm.regle.$fields.user.$fields.firstName.$touch();
    vm.regle.$fields.user.$fields.lastName.$touch();

    await nextTick();

    shouldBeErrorField(vm.regle.$fields.user.$fields.firstName);
    shouldBeErrorField(vm.regle.$fields.user.$fields.lastName);

    vm.regle.$fields.user.$fields.firstName.$reset();

    shouldBeInvalidField(vm.regle.$fields.user.$fields.firstName);
    shouldBeErrorField(vm.regle.$fields.user.$fields.lastName);
  });

  it('should reset even after coming back from cache', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithComputedValidation);

    expect(vm.regle.$fields.user.$fields.firstName).toBe(undefined);
    expect(vm.regle.$fields.user.$fields.lastName).toBe(undefined);

    vm.state.userRequired = true;
    await vm.$nextTick();

    expect(vm.regle.$fields.user.$fields.firstName?.$dirty).toBe(false);
    expect(vm.regle.$fields.user.$fields.lastName?.$dirty).toBe(false);

    vm.regle.$fields.user.$fields.firstName?.$touch();
    vm.regle.$fields.user.$fields.lastName?.$touch();
    await vm.$nextTick();

    shouldBeErrorField(vm.regle.$fields.user.$fields.firstName);
    shouldBeErrorField(vm.regle.$fields.user.$fields.lastName);

    vm.state.userRequired = false;
    await vm.$nextTick();

    expect(vm.regle.$fields.user.$fields.firstName).toBe(undefined);
    expect(vm.regle.$fields.user.$fields.lastName).toBe(undefined);

    vm.state.userRequired = true;
    await vm.$nextTick();

    shouldBeErrorField(vm.regle.$fields.user.$fields.firstName);
    shouldBeErrorField(vm.regle.$fields.user.$fields.lastName);

    vm.regle.$fields.user.$reset();

    shouldBeInvalidField(vm.regle.$fields.user.$fields.firstName);
    shouldBeInvalidField(vm.regle.$fields.user.$fields.lastName);
  });
});
