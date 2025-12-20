import { useRegleSchema } from '@regle/schemas';
import { zodFixture } from './fixtures/zod.fixture';
import { valibotFixture } from './fixtures/valibot.fixture';
import { arktypeFixture } from './fixtures/arktype.fixture';
import { nextTick } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBePristineField, shouldBeValidField } from '../../../utils/validations.utils';
import * as v from 'valibot';

describe.each([
  ['zod', zodFixture],
  ['valibot', valibotFixture],
  ['arktype', arktypeFixture],
])('collections - %s', async (name, fixture) => {
  it('should track nested collections when swapping elements', async () => {
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

  it('should track nested collections when swapping elements with rewardEarly', async () => {
    const values = {
      name: 'root',
      array: [{ test: '', nested_array: [{ rest: '' }] }],
    };

    function useSchema() {
      return useRegleSchema(values, fixture(), { rewardEarly: true });
    }

    const { vm } = createRegleComponent(useSchema);

    vm.r$.array.$value?.push({ test: '', nested_array: [{ rest: '' }] });

    await nextTick();

    vm.r$.array.$each[0].test.$value = 'test 1';
    vm.r$.array.$each[0].nested_array.$each[0].rest.$value = 'rest 1';
    await vm.r$.$validate();

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

  it('should track nested collections when adding elements with rewardEarly', async () => {
    const sport = v.object({
      type: v.literal('sport'),
      name: v.pipe(v.string(), v.nonEmpty()),
      experience: v.pipe(v.number()),
    });

    const intellectual = v.object({
      type: v.literal('intellectual'),
      name: v.pipe(v.string(), v.nonEmpty()),
      description: v.pipe(v.string(), v.nonEmpty()),
    });

    const activity = v.variant('type', [sport, intellectual]);

    const validationSchema = v.object({
      activities: v.array(activity),
    });

    const values: v.InferInput<typeof validationSchema> = {
      activities: [],
    };

    function useSchema() {
      return useRegleSchema(values, validationSchema, { rewardEarly: true });
    }

    const { vm } = createRegleComponent(useSchema);

    vm.r$.activities.$value?.push({ type: 'sport', name: '', experience: 0 });

    await nextTick();

    shouldBePristineField(vm.r$.activities.$each[0].name);
    shouldBePristineField(vm.r$.activities.$each[0].experience);
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
