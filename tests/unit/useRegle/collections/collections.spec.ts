import { createRule, useRegle } from '@regle/core';
import { isFilled, minLength, required } from '@regle/rules';
import { nextTick, ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeInvalidField, shouldBePristineField, shouldBeValidField } from '../../../utils/validations.utils';

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

    shouldBePristineField(vm.r$.$fields.level0.$each[0].$fields.level1.$each[0].$fields.name);
    expect(requiredIfSpy).toHaveBeenCalledTimes(1);
    expect(deepNestedParamSpy).toHaveBeenCalledTimes(1);

    vm.r$.$value.level0.push({ name: '', level1: [{ name: '' }] });
    await nextTick();
    shouldBeInvalidField(vm.r$.$fields.level0.$each[1].$fields.name);
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

    shouldBeInvalidField(vm.r$.$fields.level0.$each[0].$fields.level1.$each[0].$fields.name);
  });

  it('should behave correctly when changing order or deleting elements', async () => {
    const { vm } = createRegleComponent(nestedCollectionRules);

    vm.r$.$value.level0.push({ name: '', level1: [{ name: '' }] });
    await nextTick();
    vm.r$.$value.level0[0].level1[0].name = 'foo';
    await nextTick();

    shouldBeValidField(vm.r$.$fields.level0.$each[0].$fields.level1.$each[0].$fields.name);

    vm.r$.$value.level0[0].level1.push({ name: '' });
    await nextTick();
    shouldBeInvalidField(vm.r$.$fields.level0.$each[0].$fields.level1.$each[1].$fields.name);

    // Swap arrays
    const cache = vm.r$.$value.level0[0].level1[0];
    vm.r$.$value.level0[0].level1[0] = vm.r$.$value.level0[0].level1[1];
    vm.r$.$value.level0[0].level1[1] = cache;
    await vm.$nextTick();

    shouldBeInvalidField(vm.r$.$fields.level0.$each[0].$fields.level1.$each[0].$fields.name);
    shouldBeValidField(vm.r$.$fields.level0.$each[0].$fields.level1.$each[1].$fields.name);
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

    expect(vm.r$.$fields.level0.$errors.$self).toStrictEqual([]);
    expect(vm.r$.$errors.level0.$self).toStrictEqual([]);

    expectTypeOf(vm.r$.$fields.level0.$errors.$self).toEqualTypeOf<string[]>();
    expectTypeOf(vm.r$.$errors.level0.$self).toEqualTypeOf<string[]>();
    expectTypeOf(vm.r$.$errors.level0.$each[0]?.name).toEqualTypeOf<string[]>();
  });

  it("Array of files should't be considered a collection", async () => {
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
    expect(vm.r$.$fields.files.$each).toBeUndefined();

    expect(vm.r$.$fields.files.$errors).toStrictEqual([]);
    expect(vm.r$.$errors.files).toStrictEqual([]);

    expectTypeOf(vm.r$.$fields.files.$errors).toEqualTypeOf<string[]>();
    expectTypeOf(vm.r$.$errors.files).toEqualTypeOf<string[]>();
  });
});
