import { flushPromises } from '@vue/test-utils';
import { useRegle } from '@regle/core';
import { required, withMessage } from '@regle/rules';
import { ruleMockIsEven, ruleMockIsFoo } from '../../fixtures';
import { createRegleComponent } from '../../utils/test.utils';
import { nextTick, reactive, ref } from 'vue';

// TODO
// Types for errors primitives (remove $each)

function collectionWithPrimitives() {
  const form = reactive({
    array0: [null] as (number | null)[],
    nested: {
      array1: null as null | string[],
    },
    array2: [] as string[],
  });

  return {
    form,
    ...useRegle(form, () => ({
      array0: { $each: { ruleMockIsEven } },
      nested: {
        array1: { required: withMessage(required, 'Custom error'), $each: { ruleMockIsFoo } },
      },
      array2: { $each: { ruleMockIsFoo, required: withMessage(required, 'Custom error') } },
    })),
  };
}

describe('useRegle with collection validation', async () => {
  const { vm } = createRegleComponent(collectionWithPrimitives);

  it('should have a initial state', () => {
    expect(vm.errors).toStrictEqual({
      array0: {
        $errors: [],
        $each: [[]],
      },
      nested: {
        array1: {
          $errors: [],
          $each: [],
        },
      },
      array2: {
        $errors: [],
        $each: [],
      },
    });

    expect(vm.invalid).toBe(true);

    expect(vm.regle.$anyDirty).toBe(false);
    expect(vm.regle.$dirty).toBe(false);
    expect(vm.regle.$error).toBe(false);
    expect(vm.regle.$pending).toBe(false);
    expect(vm.regle.$value).toStrictEqual({
      array0: [null],
      nested: {
        array1: null,
      },
      array2: [],
    });

    expect(vm.regle.$fields.array0.$valid).toBe(true);
    expect(vm.regle.$fields.nested.$valid).toBe(false);
    expect(vm.regle.$fields.nested.$fields.array1.$valid).toBe(false);
  });

  it('should error on initial submit', async () => {
    const result = await vm.validateForm();

    expect(result).toBe(false);
    expect(vm.errors).toStrictEqual({
      array0: {
        $errors: [],
        $each: [[]],
      },
      nested: {
        array1: {
          $each: [],
          $errors: ['Custom error'],
        },
      },
      array2: {
        $errors: [],
        $each: [],
      },
    });

    expect(vm.invalid).toBe(true);

    expect(vm.regle.$anyDirty).toBe(true);
    expect(vm.regle.$dirty).toBe(true);
    expect(vm.regle.$error).toBe(true);
    expect(vm.regle.$pending).toBe(false);

    expect(vm.regle.$fields.array0.$valid).toBe(true);
    expect(vm.regle.$fields.nested.$valid).toBe(false);
    expect(vm.regle.$fields.nested.$fields.array1.$valid).toBe(false);
  });

  it('should update dirty state and errors when updating values', async () => {
    vm.regle.$value.array0[0] = 1;

    await nextTick();

    expect(vm.errors.array0.$each).toStrictEqual([['Custom error']]);
    expect(vm.errors.array0.$errors).toStrictEqual([]);

    expect(vm.invalid).toBe(true);

    expect(vm.regle.$anyDirty).toBe(true);
    expect(vm.regle.$dirty).toBe(true);
    expect(vm.regle.$fields.array0.$dirty).toBe(true);
    expect(vm.regle.$error).toBe(true);
    expect(vm.regle.$fields.array0.$error).toBe(true);
    expect(vm.regle.$pending).toBe(false);
    expect(vm.regle.$value).toStrictEqual({
      array0: [1],
      nested: {
        array1: null,
      },
      array2: [],
    });

    expect(vm.regle.$fields.array0.$valid).toBe(false);
    expect(vm.regle.$fields.array0.$each[0].$dirty).toBe(true);
    expect(vm.regle.$fields.array0.$value).toStrictEqual([1]);
    expect(vm.regle.$fields.nested.$fields.array1.$valid).toBe(false);

    vm.regle.$value.array0.push(null);
    vm.regle.$value.array0[1] = 3;

    vm.form.nested.array1 = ['bar'];
    vm.form.array2 = ['bar'];

    await nextTick();
    vm.regle.$touch();
    await nextTick();

    expect(vm.errors.array0.$each).toStrictEqual([['Custom error'], ['Custom error']]);
    expect(vm.errors.array0.$errors).toStrictEqual([]);

    expect(vm.regle.$value).toStrictEqual({
      array0: [1, 3],
      nested: {
        array1: ['bar'],
      },
      array2: ['bar'],
    });

    expect(vm.regle.$fields.nested.$fields.array1.$dirty).toBe(true);
    expect(vm.regle.$fields.nested.$fields.array1.$valid).toBe(false);
    expect(vm.regle.$fields.nested.$fields.array1.$each[0].$dirty).toBe(true);
    expect(vm.regle.$fields.nested.$fields.array1.$value).toStrictEqual(['bar']);
    expect(vm.regle.$fields.nested.$fields.array1.$each[0].$valid).toBe(false);
    expect(vm.regle.$value.nested.array1).toStrictEqual(['bar']);

    expect(vm.errors.nested.array1.$each).toStrictEqual([['Custom error']]);

    vm.form.array0[0] = 2;
    vm.form.array0[1] = 4;
    vm.form.nested.array1[0] = 'foo';
    vm.form.array2[0] = 'foo';

    vm.regle.$touch();

    await nextTick();

    expect(vm.regle.$fields.array0.$valid).toBe(true);
    expect(vm.regle.$fields.nested.$fields.array1.$valid).toBe(true);
    expect(vm.regle.$fields.nested.$fields.array1.$each[0].$dirty).toBe(true);
    expect(vm.regle.$fields.nested.$fields.array1.$value).toStrictEqual(['foo']);
    expect(vm.regle.$fields.nested.$fields.array1.$each[0].$valid).toBe(true);
    expect(vm.regle.$value.nested.array1).toStrictEqual(['foo']);

    expect(vm.errors.nested.array1.$each).toStrictEqual([[]]);
    expect(vm.regle.$fields.array0.$valid).toBe(true);
    expect(vm.regle.$fields.nested.$valid).toBe(true);
    expect(vm.regle.$fields.array2.$valid).toBe(true);
    expect(vm.regle.$valid).toBe(true);
    expect(vm.invalid).toBe(false);
  });

  it('should update status when pushing new state', async () => {
    vm.form.array0.push(6);
    vm.form.nested.array1?.push('bar');
    vm.form.array2.push('foo');

    vm.regle.$touch();

    await nextTick();

    expect(vm.regle.$fields.array0.$valid).toBe(true);

    expect(vm.regle.$fields.nested.$fields.array1.$valid).toBe(false);
    expect(vm.regle.$fields.nested.$fields.array1.$each[1].$dirty).toBe(true);
    expect(vm.regle.$fields.nested.$fields.array1.$value).toStrictEqual(['foo', 'bar']);
    expect(vm.regle.$fields.nested.$fields.array1.$valid).toBe(false);

    expect(vm.regle.$value.nested.array1).toStrictEqual(['foo', 'bar']);

    expect(vm.errors.nested.array1.$each).toStrictEqual([[], ['Custom error']]);
  });
});
