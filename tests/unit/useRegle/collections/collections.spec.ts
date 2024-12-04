import { useRegle } from '@regle/core';
import { minLength, required } from '@regle/rules';
import { nextTick, ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import {
  shouldBeInvalidField,
  shouldBePristineField,
  shouldBeValidField,
} from '../../../utils/validations.utils';

describe('collections validations', () => {
  function nestedCollectionRules() {
    const form = ref({
      level0: [] as { name: string; level1: { name: string }[] }[],
    });

    return useRegle(form, {
      level0: {
        minLength: minLength(1),
        $each: {
          name: { required },
          level1: {
            minLength: minLength(1),
            $each: {
              name: { required },
            },
          },
        },
      },
    });
  }

  it('should behave correctly with nested arrays', async () => {
    const { vm } = createRegleComponent(nestedCollectionRules);

    shouldBeInvalidField(vm.r$.$fields.level0);

    vm.r$.$value.level0.push({ name: '', level1: [{ name: '' }] });
    await nextTick();
    shouldBeInvalidField(vm.r$.$fields.level0.$each[0].$fields.name);

    vm.r$.$value.level0.push({ name: '', level1: [{ name: '' }] });
    await nextTick();
    shouldBeInvalidField(vm.r$.$fields.level0.$each[1].$fields.name);

    vm.r$.$value.level0[0].level1.push({ name: '' });
    await nextTick();
    shouldBeInvalidField(vm.r$.$fields.level0.$each[0].$fields.level1.$each[0].$fields.name);

    vm.r$.$value.level0[1].level1[0].name = 'foo';
    await nextTick();
    shouldBeValidField(vm.r$.$fields.level0.$each[1].$fields.level1.$each[0].$fields.name);

    vm.r$.$value.level0.splice(0, 1);
    await nextTick();
    shouldBeValidField(vm.r$.$fields.level0.$each[0].$fields.level1.$each[0].$fields.name);
  });

  // TODO nested with callbacks
  // TODO nested with filled arrays and reset
});
