import { useRegle } from '@regle/core';
import { dateAfter, dateBefore, required } from '@regle/rules';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBeInvalidField, shouldBeValidField } from '../../../utils/validations.utils';
import { addDays } from 'date-fns';

const emptyFile = new File([''], 'empty.png');
Object.defineProperty(emptyFile, 'size', { value: 0, configurable: true });

const normalFile = new File([''], 'normal.png');
Object.defineProperty(normalFile, 'size', { value: 1024 * 1024, configurable: true });

describe('nested validations', () => {
  function nestedCollectionRules() {
    const form = ref({
      level0: { level1: { name: '' } },
      testDate: null as Date | null,
      testFile: null as File | null,
    });

    return useRegle(form, {
      level0: {
        level1: { name: { required } },
      },
      testDate: { required, dateAfter: dateAfter(addDays(new Date(), 1)) },
      testFile: { required },
    });
  }

  it('should behave correctly with nested arrays', async () => {
    const { vm } = createRegleComponent(nestedCollectionRules);

    shouldBeInvalidField(vm.r$.$fields.level0);
    shouldBeInvalidField(vm.r$.$fields.level0.$fields.level1);
    shouldBeInvalidField(vm.r$.$fields.level0.$fields.level1.$fields.name);
    shouldBeInvalidField(vm.r$.$fields.testDate);

    vm.r$.$value = {
      level0: {
        level1: {
          name: 'foobar',
        },
      },
      testDate: new Date(),
      testFile: emptyFile,
    };

    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.level0);
    shouldBeValidField(vm.r$.$fields.level0.$fields.level1);
    shouldBeValidField(vm.r$.$fields.level0.$fields.level1.$fields.name);
    shouldBeErrorField(vm.r$.$fields.testDate);
    shouldBeErrorField(vm.r$.$fields.testFile);

    vm.r$.$reset({ toInitialState: true });

    await vm.$nextTick();

    shouldBeInvalidField(vm.r$.$fields.level0);
    shouldBeInvalidField(vm.r$.$fields.level0.$fields.level1);
    shouldBeInvalidField(vm.r$.$fields.level0.$fields.level1.$fields.name);
    shouldBeInvalidField(vm.r$.$fields.testDate);
    shouldBeInvalidField(vm.r$.$fields.testFile);

    vm.r$.$value = {
      level0: {
        level1: {
          name: 'foobar',
        },
      },
      testDate: addDays(new Date(), 3),
      testFile: normalFile,
    };
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.level0);
    shouldBeValidField(vm.r$.$fields.level0.$fields.level1);
    shouldBeValidField(vm.r$.$fields.level0.$fields.level1.$fields.name);
    shouldBeValidField(vm.r$.$fields.testDate);
    shouldBeValidField(vm.r$.$fields.testFile);
  });
});
