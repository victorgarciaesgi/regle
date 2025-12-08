import { useRegleSchema } from '@regle/schemas';
import { zodFixture } from './fixtures/zod.fixture';
import { valibotFixture } from './fixtures/valibot.fixture';
import { arktypeFixture } from './fixtures/arktype.fixture';
import { nextTick } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBeValidField } from '../../../utils/validations.utils';

describe.each([
  ['zod', zodFixture],
  ['valibot', valibotFixture],
  ['arktype', arktypeFixture],
])('collections - %s', async (name, fixture) => {
  it('should track nested collections when adding swapping elements', async () => {
    const values = {
      name: 'root',
      array: [{ test: '', nested_array: [{ rest: '' }] }],
    };

    function useSchema() {
      return useRegleSchema(values, fixture());
    }

    const { vm } = createRegleComponent(useSchema);

    vm.r$.array.$value?.push({ test: '', nested_array: [{ rest: '' }] });

    await nextTick();

    vm.r$.array.$each[0].test.$value = 'test 1';
    vm.r$.array.$each[0].nested_array.$each[0].rest.$value = 'rest 1';

    vm.r$.array.$each[1].test.$touch();
    vm.r$.array.$each[1].nested_array.$each[0].rest.$touch();

    await nextTick();

    shouldBeValidField(vm.r$.array.$each[0].test);
    shouldBeValidField(vm.r$.array.$each[0].nested_array.$each[0].rest);

    shouldBeErrorField(vm.r$.array.$each[1].test);
    shouldBeErrorField(vm.r$.array.$each[1].nested_array.$each[0].rest);

    // Invert elements
    const lastElement = vm.r$.$value.array.pop();
    vm.r$.$value.array.unshift(lastElement!);

    await nextTick();

    shouldBeErrorField(vm.r$.array.$each[0].test);
    shouldBeErrorField(vm.r$.array.$each[0].nested_array.$each[0].rest);

    shouldBeValidField(vm.r$.array.$each[1].test);
    shouldBeValidField(vm.r$.array.$each[1].nested_array.$each[0].rest);
  });

  it('should work with an empty array', async () => {
    const values = {
      name: 'root',
      array: [],
    };

    function useSchema() {
      return useRegleSchema(values, fixture());
    }

    const { vm } = createRegleComponent(useSchema);

    await vm.r$.$validate();
    await nextTick();

    shouldBeErrorField(vm.r$.array);

    expect(vm.r$.array.$errors.$self).toStrictEqual(['Array must contain at least 1 element']);
  });
});
