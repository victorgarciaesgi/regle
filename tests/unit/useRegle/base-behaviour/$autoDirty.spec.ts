import { nextTick } from 'vue';
import { simpleNestedStateWithMixedValidation } from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
import {
  shouldBeErrorField,
  shouldBeInvalidField,
  shouldBeValidField,
} from '../../../utils/validations.utils';

describe('$autoDirty', () => {
  it('should update the $dirty state to true when value changes', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);
    shouldBeInvalidField(vm.r$.$fields.email);
    shouldBeInvalidField(vm.r$.$fields.user.$fields.firstName);
    shouldBeInvalidField(vm.r$.$fields.user.$fields.lastName);
    shouldBeInvalidField(vm.r$.$fields.contacts.$each[0]);

    vm.state.email = 'foo';
    await nextTick();
    shouldBeErrorField(vm.r$.$fields.email);

    vm.state.email = 'foo@gmail.com';
    await nextTick();
    shouldBeValidField(vm.r$.$fields.email);
  });

  it('should update the `$dirty` state to `true`, even after `$reset`', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

    vm.state.email = 'foo';
    await nextTick();
    shouldBeErrorField(vm.r$.$fields.email);

    vm.r$.$reset();
    expect(vm.r$.$fields.email.$dirty).toBe(false);

    vm.state.email = 'bar';
    await nextTick();
    shouldBeErrorField(vm.r$.$fields.email);
  });

  it('when used at root with plain object, should update the $dirty state', async () => {
    // const number = ref(1)
    // const { vm } = await createSimpleWrapper({ number: { isEven } }, { number }, { $autoDirty: true })
    // shouldBeInvalidValidationObject({ v: vm.v.number, property: 'number', validatorName: 'isEven' })
    // number.value = 3
    // await vm.$nextTick()
    // shouldBeErroredValidationObject({ v: vm.v.number, property: 'number', validatorName: 'isEven' })
    // number.value = 2
    // await vm.$nextTick()
    // expect(vm.v.$errors).toHaveLength(0)
    // expect(vm.v.number).toHaveProperty('$error', false)
    // expect(vm.v.number).toHaveProperty('$dirty', true)
    // expect(vm.v.number).toHaveProperty('$anyDirty', true)
    // expect(vm.v.number).toHaveProperty('$invalid', false)
  });
});
