import { useRegle } from '@regle/core';
import { numeric, required } from '@regle/rules';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBeInvalidField, shouldBeValidField } from '../../../utils/validations.utils';

function singleFieldValidion() {
  const formState = ref<number | undefined>();
  return useRegle(formState, { required, numeric });
}

describe('useRegle should work with single field validation', () => {
  it('should behave like a object state', async () => {
    const { vm } = createRegleComponent(singleFieldValidion);

    shouldBeInvalidField(vm.r$);

    vm.r$.$value = 0;
    await vm.$nextTick();

    shouldBeValidField(vm.r$);

    vm.r$.$value = 'foo' as any;
    await vm.$nextTick();

    shouldBeErrorField(vm.r$);

    vm.r$.$reset();
    await vm.$nextTick();

    shouldBeInvalidField(vm.r$);

    const { valid, data } = await vm.r$.$validate();

    expect(valid).toBe(false);
  });
});
