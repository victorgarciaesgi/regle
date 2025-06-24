import { createRule, useRegle } from '@regle/core';
import { isFilled, minLength, required } from '@regle/rules';
import { nextTick, ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import {
  shouldBeErrorField,
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

    shouldBeInvalidField(vm.r$.level0);

    vm.r$.$value.level0.push({ name: '', level1: [{ name: '' }] });
    await nextTick();
    shouldBeInvalidField(vm.r$.level0.$each[0].name);

    vm.r$.$value.level0.push({ name: '', level1: [{ name: '' }] });
    await nextTick();
    shouldBeInvalidField(vm.r$.level0.$each[1].name);

    vm.r$.$value.level0[0].level1.push({ name: '' });
    await nextTick();
    shouldBeInvalidField(vm.r$.level0.$each[0].level1.$each[0].name);

    vm.r$.$value.level0[1].level1[0].name = 'foo';
    await nextTick();
    shouldBeValidField(vm.r$.level0.$each[1].level1.$each[0].name);

    vm.r$.$value.level0.splice(0, 1);
    await nextTick();
    shouldBeValidField(vm.r$.level0.$each[0].level1.$each[0].name);
  });

  const requiredIfSpy = vi.fn((value: unknown, condition: boolean) => {
    if (condition) {
      return isFilled(value);
    }
    return true;
  });

  const deepNestedParamSpy = vi.fn((params: Object) => {
    return true;
  });

  const deepNestedParamRule = createRule({
    validator(value: unknown, params: Object) {
      return deepNestedParamSpy(params);
    },
    message: 'This field is required',
  });

  const requiredIfMock = createRule({
    validator(value: unknown, condition: boolean) {
      return requiredIfSpy(value, condition);
    },
    message: 'This field is required',
  });

  function nestedCollectionRulesWithCallbacks() {
    const form = ref({
      level0: [
        {
          name: '',
          level1: [
            {
              name: '',
            },
          ],
        },
      ] as { name: string; level1: { name: string }[] }[],
    });

    return useRegle(form, {
      level0: {
        $each: (parent, index) => ({
          name: { required },
          level1: {
            $each: (value, index) => ({
              name: {
                required: requiredIfMock(() => parent.value.name === 'required'),
                nested: deepNestedParamRule(value),
              },
            }),
          },
        }),
      },
    });
  }
  it('should behave correctly with nested array callbacks', async () => {
    const { vm } = createRegleComponent(nestedCollectionRulesWithCallbacks);

    shouldBePristineField(vm.r$.level0.$each[0].level1.$each[0].name);
    expect(requiredIfSpy).toHaveBeenCalledTimes(1);
    expect(deepNestedParamSpy).toHaveBeenCalledTimes(1);

    vm.r$.$value.level0.push({ name: '', level1: [{ name: '' }] });
    await nextTick();
    shouldBeInvalidField(vm.r$.level0.$each[1].name);
    expect(requiredIfSpy).toHaveBeenCalledTimes(2);
    expect(deepNestedParamSpy).toHaveBeenCalledTimes(2);

    vm.r$.$value.level0[0].level1.push({ name: '' });
    await nextTick();
    expect(requiredIfSpy).toHaveBeenCalledTimes(3);
    expect(deepNestedParamSpy).toHaveBeenCalledTimes(3);

    vm.r$.$value.level0[0].name = 'required';
    await nextTick();
    expect(requiredIfSpy).toHaveBeenCalledTimes(5);
    expect(deepNestedParamSpy).toHaveBeenCalledTimes(3);

    shouldBeInvalidField(vm.r$.level0.$each[0].level1.$each[0].name);
  });

  it('should behave correctly when changing order or deleting elements', async () => {
    const { vm } = createRegleComponent(nestedCollectionRules);

    vm.r$.$value.level0.push({ name: '', level1: [{ name: '' }] });
    await nextTick();
    vm.r$.$value.level0[0].level1[0].name = 'foo';
    await nextTick();

    shouldBeValidField(vm.r$.level0.$each[0].level1.$each[0].name);

    vm.r$.$value.level0[0].level1.push({ name: '' });
    await nextTick();
    shouldBeInvalidField(vm.r$.level0.$each[0].level1.$each[1].name);

    // Swap arrays
    const cache = vm.r$.$value.level0[0].level1[0];
    vm.r$.$value.level0[0].level1[0] = vm.r$.$value.level0[0].level1[1];
    vm.r$.$value.level0[0].level1[1] = cache;
    await vm.$nextTick();

    shouldBeInvalidField(vm.r$.level0.$each[0].level1.$each[0].name);
    shouldBeValidField(vm.r$.level0.$each[0].level1.$each[1].name);
  });

  it("shouldn't be considered collection if no $each rule is present", async () => {
    function regleComposable() {
      const form = ref({
        level0: [] as { name: string; level1: { name: string }[] }[],
      });

      return useRegle(form, {
        level0: {
          minLength: minLength(1),
          $each: {},
        },
      });
    }

    const { vm } = createRegleComponent(regleComposable);

    expect(vm.r$.level0.$errors.$self).toStrictEqual([]);
    expect(vm.r$.$errors.level0.$self).toStrictEqual([]);

    expectTypeOf(vm.r$.level0.$errors.$self).toEqualTypeOf<string[]>();
    expectTypeOf(vm.r$.$errors.level0.$self).toEqualTypeOf<string[]>();
    expectTypeOf(vm.r$.$errors.level0.$each[0]?.name).toEqualTypeOf<string[]>();
  });

  it("Array of files shouldn't be considered a collection", async () => {
    function regleComposable() {
      const form = ref({
        files: [] as File[],
      });

      return useRegle(form, {
        files: {
          minLength: minLength(1),
        },
      });
    }

    const { vm } = createRegleComponent(regleComposable);

    // @ts-expect-error This should not be considered a collection
    expect(vm.r$.files.$each).toBeUndefined();

    expect(vm.r$.files.$errors).toStrictEqual([]);
    expect(vm.r$.$errors.files).toStrictEqual([]);

    expectTypeOf(vm.r$.files.$errors).toEqualTypeOf<string[]>();
    expectTypeOf(vm.r$.$errors.files).toEqualTypeOf<string[]>();
  });

  it('should track dirty state correctly', async () => {
    function regleComposable() {
      function swap(arr: any[]) {
        if (!Array.isArray(arr)) {
          throw new Error('expected an array');
        }

        if (arr.length < 2) {
          return arr;
        }

        var result = arr.slice();

        const temp = result[0];
        result[0] = result[1];
        result[1] = temp;

        return result;
      }

      const form = ref<{ collection: Array<{ name: string }> }>({
        collection: [{ name: '' }],
      });

      const { r$ } = useRegle(form, {
        collection: {
          $each: {
            name: { required },
          },
        },
      });

      return {
        r$,
        swap,
      };
    }

    const { vm } = createRegleComponent(regleComposable);

    vm.r$.$value.collection.push({ name: '' });
    vm.r$.$value.collection.push({ name: '' });
    await vm.$nextTick();

    shouldBeInvalidField(vm.r$.collection.$each[0]);
    shouldBeInvalidField(vm.r$.collection.$each[1]);
    shouldBeInvalidField(vm.r$.collection.$each[2]);

    vm.r$.$value.collection = vm.swap(vm.r$.$value.collection);
    await vm.$nextTick();

    shouldBeInvalidField(vm.r$.collection.$each[0]);
    shouldBeInvalidField(vm.r$.collection.$each[1]);
    shouldBeInvalidField(vm.r$.collection.$each[2]);

    vm.r$.collection.$each[1].$touch();
    await vm.$nextTick();

    shouldBeInvalidField(vm.r$.collection.$each[0]);
    shouldBeErrorField(vm.r$.collection.$each[1]);
    shouldBeInvalidField(vm.r$.collection.$each[2]);

    vm.r$.$value.collection.push({ name: '' });
    vm.r$.$value.collection.push({ name: '' });
    await vm.$nextTick();

    shouldBeInvalidField(vm.r$.collection.$each[0]);
    shouldBeErrorField(vm.r$.collection.$each[1]);
    shouldBeInvalidField(vm.r$.collection.$each[2]);
    shouldBeInvalidField(vm.r$.collection.$each[3]);
    shouldBeInvalidField(vm.r$.collection.$each[4]);

    vm.r$.$value.collection.unshift({ name: '' });
    await vm.$nextTick();

    shouldBeInvalidField(vm.r$.collection.$each[0]);
    shouldBeInvalidField(vm.r$.collection.$each[1]);
    shouldBeErrorField(vm.r$.collection.$each[2]);
    shouldBeInvalidField(vm.r$.collection.$each[3]);
    shouldBeInvalidField(vm.r$.collection.$each[4]);
    shouldBeInvalidField(vm.r$.collection.$each[5]);

    vm.r$.$reset();
    await vm.r$.$validate();
    await vm.$nextTick();

    shouldBeErrorField(vm.r$.collection.$each[0]);
    shouldBeErrorField(vm.r$.collection.$each[1]);
    shouldBeErrorField(vm.r$.collection.$each[2]);
    shouldBeErrorField(vm.r$.collection.$each[3]);
    shouldBeErrorField(vm.r$.collection.$each[4]);
    shouldBeErrorField(vm.r$.collection.$each[5]);

    vm.r$.$value.collection.unshift({ name: '' });
    await vm.$nextTick();

    shouldBeInvalidField(vm.r$.collection.$each[0]);
    shouldBeErrorField(vm.r$.collection.$each[1]);
    shouldBeErrorField(vm.r$.collection.$each[2]);
    shouldBeErrorField(vm.r$.collection.$each[3]);
    shouldBeErrorField(vm.r$.collection.$each[4]);
    shouldBeErrorField(vm.r$.collection.$each[5]);
    shouldBeErrorField(vm.r$.collection.$each[6]);

    vm.r$.$value.collection.splice(2, 0, { name: '' });
    await vm.$nextTick();

    shouldBeInvalidField(vm.r$.collection.$each[0]);
    shouldBeErrorField(vm.r$.collection.$each[1]);
    shouldBeInvalidField(vm.r$.collection.$each[2]);
    shouldBeErrorField(vm.r$.collection.$each[3]);
    shouldBeErrorField(vm.r$.collection.$each[4]);
    shouldBeErrorField(vm.r$.collection.$each[5]);
    shouldBeErrorField(vm.r$.collection.$each[6]);
    shouldBeErrorField(vm.r$.collection.$each[7]);
  });
});
