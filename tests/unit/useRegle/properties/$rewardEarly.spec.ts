import { useRegle } from '@regle/core';
import { flushPromises } from '@vue/test-utils';
import { ref } from 'vue';
import { mockedValidations, nestedReactiveObjectValidation, ruleMockIsEvenAsync } from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBePristineField, shouldBeValidField } from '../../../utils/validations.utils';

describe('$rewardEarly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sync', () => {
    it('does not validate, until manually called', async () => {
      const { vm } = createRegleComponent(() => nestedReactiveObjectValidation({ rewardEarly: true }));

      shouldBePristineField(vm.r$.level0);
      shouldBePristineField(vm.r$.level1.child);
      shouldBePristineField(vm.r$.level1.level2.child);
      shouldBePristineField(vm.r$.level1.collection.$each[0].name);
      expect(mockedValidations.isEven).toHaveBeenCalledTimes(0);

      vm.r$.$value.level0 = 3;
      await vm.$nextTick();
      expect(mockedValidations.isEven).toHaveBeenCalledTimes(0);
      shouldBePristineField(vm.r$.level0);

      vm.r$.$value = {
        level0: 2,
        level0Boolean: true,
        level1: {
          child: 2,
          level2: {
            child: 2,
          },
          collection: [{ name: 2 }],
        },
      };
      vm.r$.$validate();
      await vm.$nextTick();
      expect(mockedValidations.isEven).toHaveBeenCalledTimes(4);

      shouldBeValidField(vm.r$.level0);
      shouldBeValidField(vm.r$.level1.child);
      shouldBeValidField(vm.r$.level1.level2.child);
      shouldBeValidField(vm.r$.level1.collection.$each[0].name);
    });

    it('sets state as normal, stops validating upon success', async () => {
      const { vm } = createRegleComponent(() => nestedReactiveObjectValidation({ rewardEarly: true }));

      vm.r$.$value.level0 = 3;
      await vm.$nextTick();
      vm.r$.level0.$validate();
      await vm.$nextTick();

      expect(mockedValidations.isEven).toHaveBeenCalledTimes(1);
      shouldBeErrorField(vm.r$.level0);

      vm.r$.$value.level0 = 5;
      await vm.$nextTick();
      expect(mockedValidations.isEven).toHaveBeenCalledTimes(2);
      shouldBeErrorField(vm.r$.level0);

      vm.r$.$value.level0 = 2;
      await vm.$nextTick();
      expect(mockedValidations.isEven).toHaveBeenCalledTimes(3);
      shouldBeValidField(vm.r$.level0);

      vm.r$.$value.level0 = 1;
      await vm.$nextTick();
      expect(mockedValidations.isEven).toHaveBeenCalledTimes(3);
      shouldBeValidField(vm.r$.level0);
    });

    it('works with nested objects', async () => {
      const { vm } = createRegleComponent(() => nestedReactiveObjectValidation({ rewardEarly: true }));

      vm.r$.$validate();
      await vm.$nextTick();
      expect(mockedValidations.isEven).toHaveBeenCalledTimes(4);

      vm.r$.$value.level0 = 1; // 0 is already even, so this wont trigger
      vm.r$.$value.level1.child = 2; // this will get set as true
      vm.r$.$value.level1.level2.child = 3; // this is already even
      vm.r$.$value.level1.collection[0].name = 3; // 0 is already even, so this wont trigger

      await vm.$nextTick();

      expect(mockedValidations.isEven).toHaveBeenCalledTimes(5);
      shouldBeValidField(vm.r$.level0);
      shouldBeValidField(vm.r$.level1.child);
      shouldBeValidField(vm.r$.level1.level2.child);
      shouldBeValidField(vm.r$.level1.collection.$each[0].name);

      await vm.r$.$validate();
      await vm.$nextTick();

      expect(mockedValidations.isEven).toHaveBeenCalledTimes(9); // another 4 calls for the 4 items
      shouldBeErrorField(vm.r$.level0);
      shouldBeValidField(vm.r$.level1.child);
      shouldBeErrorField(vm.r$.level1.level2.child);
      shouldBeErrorField(vm.r$.level1.collection.$each[0].name);
    });

    function nestedAsyncObjectWithRefsValidation() {
      const form = ref({
        level0: 0,
        level1: {
          child: 0,
        },
        collection: [{ child: 0 }],
      });

      return useRegle(
        form,
        {
          level0: { ruleEvenAsync: ruleMockIsEvenAsync() },
          level1: {
            child: { ruleEven: ruleMockIsEvenAsync() },
          },
          collection: {
            $each: {
              child: { ruleEvenAsync: ruleMockIsEvenAsync(2000) },
            },
          },
        },
        { rewardEarly: true }
      );
    }

    describe('async', () => {
      it('sets state as normal, stops validating upon success', async () => {
        vi.useFakeTimers();
        const { vm } = createRegleComponent(nestedAsyncObjectWithRefsValidation);
        expect(mockedValidations.isEven).toHaveBeenCalledTimes(0);
        vm.r$.level0.$validate();
        await vi.advanceTimersByTimeAsync(1200);
        await vm.$nextTick();
        expect(mockedValidations.isEven).toHaveBeenCalledTimes(1);
        await flushPromises();

        shouldBeValidField(vm.r$.level0);

        vm.r$.level0.$value = 3;
        await vm.$nextTick();
        expect(mockedValidations.isEven).toHaveBeenCalledTimes(1);

        vm.r$.level0.$validate();
        await vi.advanceTimersByTimeAsync(1200);
        await vm.$nextTick();
        expect(mockedValidations.isEven).toHaveBeenCalledTimes(2);
        await flushPromises();
        shouldBeErrorField(vm.r$.level0);

        vm.r$.level0.$value = 2;
        await vi.advanceTimersByTimeAsync(1200);
        await vm.$nextTick();
        expect(mockedValidations.isEven).toHaveBeenCalledTimes(3);
        await flushPromises();

        shouldBeValidField(vm.r$.level0);

        vi.useRealTimers();
      });
    });
  });
});
