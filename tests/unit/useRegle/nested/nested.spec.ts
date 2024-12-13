import { useRegle } from '@regle/core';
import { required } from '@regle/rules';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeInvalidField, shouldBeValidField } from '../../../utils/validations.utils';

describe('nested validations', () => {
  function nestedCollectionRules() {
    const form = ref({
      level0: { level1: { name: '' } },
    });

    return useRegle(form, {
      level0: {
        level1: { name: { required } },
      },
    });
  }

  it('should behave correctly with nested arrays', async () => {
    const { vm } = createRegleComponent(nestedCollectionRules);

    shouldBeInvalidField(vm.r$.$fields.level0);
    shouldBeInvalidField(vm.r$.$fields.level0.$fields.level1);
    shouldBeInvalidField(vm.r$.$fields.level0.$fields.level1.$fields.name);

    vm.r$.$value = {
      level0: {
        level1: {
          name: 'foobar',
        },
      },
    };
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.level0);
    shouldBeValidField(vm.r$.$fields.level0.$fields.level1);
    shouldBeValidField(vm.r$.$fields.level0.$fields.level1.$fields.name);

    vm.r$.$resetAll();

    await vm.$nextTick();

    shouldBeInvalidField(vm.r$.$fields.level0);
    shouldBeInvalidField(vm.r$.$fields.level0.$fields.level1);
    shouldBeInvalidField(vm.r$.$fields.level0.$fields.level1.$fields.name);

    vm.r$.$value = {
      level0: {
        level1: {
          name: 'foobar',
        },
      },
    };
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.level0);
    shouldBeValidField(vm.r$.$fields.level0.$fields.level1);
    shouldBeValidField(vm.r$.$fields.level0.$fields.level1.$fields.name);
  });
});
