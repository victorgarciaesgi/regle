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

    vm.r$.$value.email = 'foo';
    await nextTick();
    shouldBeErrorField(vm.r$.$fields.email);

    vm.r$.$value.email = 'foo@gmail.com';
    await nextTick();
    shouldBeValidField(vm.r$.$fields.email);
  });

  it('should update the `$dirty` state to `true`, even after `$reset`', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

    vm.r$.$value.email = 'foo';
    await nextTick();
    shouldBeErrorField(vm.r$.$fields.email);

    vm.r$.$reset();
    expect(vm.r$.$fields.email.$dirty).toBe(false);

    vm.r$.$value.email = 'bar';
    await nextTick();
    shouldBeErrorField(vm.r$.$fields.email);
  });
});
