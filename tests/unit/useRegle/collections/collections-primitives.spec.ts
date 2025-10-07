import { useRegle } from '@regle/core';
import { minLength } from '@regle/rules';
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

    shouldBeInvalidField(vm.r$.collection);

    vm.r$.$value.collection.push(4, 5);
    await vm.$nextTick();

    shouldBeValidField(vm.r$.collection);

    // @ts-expect-error
    expect(vm.r$.collection.$each).toBeUndefined();
    expect(vm.r$.$errors.collection).toStrictEqual([]);

    expectTypeOf(vm.r$.collection.$errors).toEqualTypeOf<string[]>();
    expectTypeOf(vm.r$.$errors.collection).toEqualTypeOf<string[]>();
  });
});
