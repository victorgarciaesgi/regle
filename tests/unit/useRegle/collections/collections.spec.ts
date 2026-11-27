import { createRule, useRegle, type RegleCollectionErrors } from '@regle/core';
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

  const deepNestedParamSpy = vi.fn((_params: object) => {
    return true;
  });

  const deepNestedParamRule = createRule({
    validator(value: unknown, params: object) {
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
        $each: (parent, _index) => ({
          name: { required },
          level1: {
            $each: (value, _index) => ({
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
          $each: {
            required,
          },
        },
      });
    }

    const { vm } = createRegleComponent(regleComposable);

    expect(vm.r$.files.$each).toBeDefined();

    expect(vm.r$.files.$errors.$each).toStrictEqual([]);
    expect(vm.r$.files.$errors.$self).toStrictEqual([]);
    expect(vm.r$.$errors.files.$each).toStrictEqual([]);
    expect(vm.r$.$errors.files.$self).toStrictEqual([]);

    expectTypeOf(vm.r$.files.$errors).toEqualTypeOf<RegleCollectionErrors<File[]>>();
    expectTypeOf(vm.r$.$errors.files.$each[0]).toEqualTypeOf<string[]>();
    expectTypeOf(vm.r$.$errors.files.$self).toEqualTypeOf<string[]>();
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

  it('should ignore `$key` returned from `$each` when validating (#409)', async () => {
    const { r$ } = useRegle(
      ref({
        items: [
          { id: 1, name: 'foo' },
          { id: 2, name: 'bar' },
        ],
      }),
      {
        items: {
          $each: (item) => ({
            $key: item.value.id,
            name: { required },
          }),
        },
      }
    );

    expect(Object.keys(r$.items.$each[0].$fields)).not.toContain('$key');
    expect(r$.$validateSync()).toBe(true);
    expect((await r$.$validate()).valid).toBe(true);
    expect(r$.$invalid).toBe(false);
  });

  describe('immutable updates of a collection using `$key` (#416)', () => {
    function keyedCollection(options?: { autoDirty?: boolean; silent?: boolean }) {
      const form = ref({
        items: [
          { id: 1, name: 'foo' },
          { id: 2, name: 'bar' },
        ],
      });

      const { r$ } = useRegle(
        form,
        {
          items: {
            $each: (item) => ({
              $key: item.value.id,
              name: { required },
            }),
          },
        },
        options
      );

      return { form, r$ };
    }

    function unkeyedCollection() {
      const form = ref({
        items: [
          { id: 1, name: 'foo' },
          { id: 2, name: 'bar' },
        ],
      });

      const { r$ } = useRegle(form, {
        items: {
          $each: {
            name: { required },
          },
        },
      });

      return { form, r$ };
    }

    it('should mark only the replaced item as dirty', async () => {
      const { form, r$ } = keyedCollection();

      expect(r$.items.$each[0].name.$dirty).toBe(false);
      expect(r$.items.$each[1].name.$dirty).toBe(false);

      form.value.items = form.value.items.map((item) => (item.id === 1 ? { ...item, name: '' } : item));
      await nextTick();

      expect(r$.items.$each[0].name.$value).toBe('');
      shouldBeErrorField(r$.items.$each[0].name);

      expect(r$.items.$each[1].name.$value).toBe('bar');
      shouldBePristineField(r$.items.$each[1].name);
    });

    it('should not mark reordered items as dirty', async () => {
      const { form, r$ } = keyedCollection();

      form.value.items = [form.value.items[1], form.value.items[0]];
      await nextTick();

      expect(r$.items.$each[0].name.$value).toBe('bar');
      expect(r$.items.$each[1].name.$value).toBe('foo');
      shouldBePristineField(r$.items.$each[0].name);
      shouldBePristineField(r$.items.$each[1].name);
    });

    it('should not mark a replaced item as dirty when `autoDirty` is false', async () => {
      const { form, r$ } = keyedCollection({ autoDirty: false });

      form.value.items = form.value.items.map((item) => (item.id === 1 ? { ...item, name: '' } : item));
      await nextTick();

      expect(r$.items.$each[0].name.$value).toBe('');
      expect(r$.items.$each[0].name.$dirty).toBe(false);
      expect(r$.items.$each[0].name.$error).toBe(false);
    });

    it('should not mark a replaced item as dirty when `silent` is true', async () => {
      const { form, r$ } = keyedCollection({ silent: true });

      form.value.items = form.value.items.map((item) => (item.id === 1 ? { ...item, name: '' } : item));
      await nextTick();

      expect(r$.items.$each[0].name.$value).toBe('');
      expect(r$.items.$each[0].name.$dirty).toBe(false);
      expect(r$.items.$each[0].name.$error).toBe(false);
    });

    it('should validate the item currently in the array when the original object is restored', async () => {
      const { form, r$ } = keyedCollection();
      const original = form.value.items[0];

      form.value.items = [{ ...original, name: '' }, form.value.items[1]];
      await nextTick();

      expect(r$.items.$each[0].name.$value).toBe('');
      expect(r$.items.$each[0].name.$invalid).toBe(true);

      form.value.items = [original, form.value.items[1]];
      await nextTick();

      expect(form.value.items[0].name).toBe('foo');
      expect(r$.items.$each[0].name.$value).toBe('foo');
      expect(r$.items.$each[0].name.$invalid).toBe(false);
      expect(r$.$validateSync()).toBe(true);
      expect((await r$.$validate()).valid).toBe(true);
    });

    it('should keep the behavior of a collection without `$key` unchanged', async () => {
      const { form, r$ } = unkeyedCollection();
      const original = form.value.items[0];

      form.value.items = form.value.items.map((item) => (item.id === 1 ? { ...item, name: '' } : item));
      await nextTick();

      expect(r$.items.$each[0].name.$value).toBe('');
      expect(r$.items.$each[0].name.$dirty).toBe(false);

      form.value.items = [original, form.value.items[1]];
      await nextTick();

      expect(r$.items.$each[0].name.$value).toBe('foo');
      expect(r$.items.$each[0].name.$dirty).toBe(false);
      expect(r$.$validateSync()).toBe(true);
      expect((await r$.$validate()).valid).toBe(true);
    });

    it('should track an item whose `$key` is `0`', async () => {
      const form = ref({
        items: [
          { id: 0, name: 'zero' },
          { id: 1, name: 'one' },
        ],
      });

      const { r$ } = useRegle(form, {
        items: {
          $each: (item) => ({
            $key: item.value.id,
            name: { required },
          }),
        },
      });

      form.value.items = [form.value.items[1], form.value.items[0]];
      await nextTick();

      shouldBePristineField(r$.items.$each[0].name);
      shouldBePristineField(r$.items.$each[1].name);

      form.value.items = form.value.items.map((item) => ({ ...item, name: '' }));
      await nextTick();

      shouldBeErrorField(r$.items.$each[0].name);
      shouldBeErrorField(r$.items.$each[1].name);
    });

    it('should not mark the remaining items as dirty after an item is removed', async () => {
      const form = ref({
        items: [
          { id: '0', name: 'zero' },
          { id: '1', name: 'one' },
          { id: '2', name: 'two' },
        ],
      });

      const { r$ } = useRegle(form, {
        items: {
          $each: (item) => ({
            $key: item.value.id,
            name: { required },
          }),
        },
      });

      form.value.items = [form.value.items[0], form.value.items[1]];
      await nextTick();

      form.value.items = [form.value.items[1], form.value.items[0]];
      await nextTick();

      expect(r$.items.$each[0].name.$value).toBe('one');
      expect(r$.items.$each[1].name.$value).toBe('zero');
      shouldBePristineField(r$.items.$each[0].name);
      shouldBePristineField(r$.items.$each[1].name);
    });
  });
});
