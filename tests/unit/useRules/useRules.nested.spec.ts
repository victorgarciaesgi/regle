import { useRules } from '@regle/core';
import { dateAfter, dateBefore, required, string, type } from '@regle/rules';
import { addDays } from 'date-fns';
import { createRegleComponent } from '../../utils/test.utils';
import { shouldBeErrorField, shouldBeInvalidField, shouldBeValidField } from '../../utils/validations.utils';

const emptyFile = new File([''], 'empty.png');
Object.defineProperty(emptyFile, 'size', { value: 0, configurable: true });

const normalFile = new File([''], 'normal.png');
Object.defineProperty(normalFile, 'size', { value: 1024 * 1024, configurable: true });

describe('nested validations', () => {
  function nestedCollectionRules() {
    const rules = {
      level0: {
        level1: { name: { required, string } },
        level2: { required, string },
      },
      collection: {
        $each: {
          name: { required, string },
        },
      },
      testDate: { required, dateAfter: dateAfter(addDays(new Date(), 1)) },
      testFile: { required, type: type<File>() },
    };
    return { r$: useRules(rules) };
  }

  it('should behave correctly with nested arrays', async () => {
    const { vm } = createRegleComponent(nestedCollectionRules);

    shouldBeInvalidField(vm.r$.level0);
    shouldBeInvalidField(vm.r$.level0.level1);
    shouldBeInvalidField(vm.r$.level0.level1.name);
    shouldBeInvalidField(vm.r$.testDate);
    shouldBeInvalidField(vm.r$.collection.$each[0].name);

    vm.r$.$value.level0.level1.name = 'Hello';
    await vm.$nextTick();

    shouldBeInvalidField(vm.r$.level0);

    vm.r$.$value = {
      level0: {
        level1: {
          name: 'foobar',
        },
        level2: '',
      },
      collection: [{ name: '' }],
      testDate: new Date(),
      testFile: emptyFile,
    };

    await vm.$nextTick();

    shouldBeErrorField(vm.r$.level0);
    shouldBeValidField(vm.r$.level0.level1);
    shouldBeValidField(vm.r$.level0.level1.name);
    shouldBeErrorField(vm.r$.testDate);
    shouldBeErrorField(vm.r$.testFile);
    shouldBeErrorField(vm.r$.collection);
    shouldBeErrorField(vm.r$.collection.$each[0].name);

    vm.r$.$reset({ toInitialState: true });

    await vm.$nextTick();

    shouldBeInvalidField(vm.r$.level0);
    shouldBeInvalidField(vm.r$.level0.level1);
    shouldBeInvalidField(vm.r$.level0.level1.name);
    shouldBeInvalidField(vm.r$.testDate);
    shouldBeInvalidField(vm.r$.testFile);

    vm.r$.$value = {
      level0: {
        level1: {
          name: 'foobar',
        },
        level2: 'Foo',
      },
      collection: [{ name: 'foo' }],
      testDate: addDays(new Date(), 3),
      testFile: normalFile,
    };
    await vm.$nextTick();

    shouldBeValidField(vm.r$.level0);
    shouldBeValidField(vm.r$.level0.level1);
    shouldBeValidField(vm.r$.level0.level1.name);
    shouldBeValidField(vm.r$.testDate);
    shouldBeValidField(vm.r$.testFile);
    shouldBeValidField(vm.r$.collection);
    shouldBeValidField(vm.r$.collection.$each[0].name);
  });

  it('should implement standard schema v1 issues', async () => {
    const rules = {
      level0: {
        level1: { name: { required, string } },
        level2: { required, string },
      },
      collection: {
        $each: {
          name: { required, string },
        },
      },
      testDate: { required, dateAfter: dateBefore(new Date(2000, 1, 1), { allowEqual: false }) },
      testFile: { required, type: type<File>() },
    };

    const schema = useRules(rules);

    const result = await schema['~standard'].validate({
      level0: { level1: { name: '' }, level2: '' },
      collection: [{ name: '' }, { name: 'foo' }, { name: '' }],
      testDate: new Date(),
      testFile: emptyFile,
    });

    expect(result.issues).toStrictEqual([
      { message: 'This field is required', path: ['level0', 'level1', 'name'] },
      { message: 'This field is required', path: ['level0', 'level2'] },
      { message: 'This field is required', path: ['collection', 0, 'name'] },
      { message: 'This field is required', path: ['collection', 2, 'name'] },
      { message: 'The date must be before 2/1/00', path: ['testDate'] },
      { message: 'This field is required', path: ['testFile'] },
    ]);

    const result2 = await schema['~standard'].validate({
      level0: { level1: { name: 'foobar' }, level2: 'Foo' },
      collection: [{ name: 'foo' }],
      testDate: new Date(1999, 1, 1),
      testFile: normalFile,
    });

    expect(result2.issues).toStrictEqual([]);
  });
});
