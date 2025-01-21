import { useRegle } from '@regle/core';
import { minLength, numeric, required } from '@regle/rules';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeInvalidField, shouldBeValidField } from '../../../utils/validations.utils';

describe('collections of primitives', () => {
  function primitivesCollectionsRules() {
    const form = ref({
      collection: [1, 2, 3] as number[],
    });

    return useRegle(form, {
      collection: {
        minLength: minLength(4),
      },
    });
  }

  it('should behave correctly with primitives collection and no $each rule', async () => {
    const { vm } = createRegleComponent(primitivesCollectionsRules);

    shouldBeInvalidField(vm.r$.$fields.collection.$self);
    shouldBeInvalidField(vm.r$.$fields.collection);

    vm.r$.$value.collection.push(4, 5);
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.collection.$self);
    shouldBeValidField(vm.r$.$fields.collection);
  });
});
