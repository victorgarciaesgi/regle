import { flushPromises } from '@vue/test-utils';
import { useRegle } from '@regle/core';
import { required } from '@regle/validators';
import { ruleMockIsEven, ruleMockIsFoo } from '../../fixtures';
import { createRegleComponent } from '../../utils/test.utils';
import { nextTick, ref } from 'vue';

// TODO
// Types for errors primitives (remove $each)

function collectionWithPrimitives() {
  const form = {
    array0: [] as number[],
    nested: {
      array1: null as null | string[],
    },
  };

  return {
    form,
    ...useRegle(form, () => ({
      array0: { $each: { ruleMockIsEven } },
      nested: {
        array1: { required, $each: { ruleMockIsFoo } },
      },
    })),
  };
}

describe('useRegle with collection validation', async () => {
  const { vm } = createRegleComponent(collectionWithPrimitives);

  it('should have a initial state', () => {
    expect(vm.errors).toStrictEqual({
      array0: {
        $errors: [],
        $each: [],
      },
      nested: {
        array1: {
          $errors: [],
          $each: [],
        },
      },
    });

    expect(vm.invalid).toBe(true);

    expect(vm.regle.$anyDirty).toBe(false);
    expect(vm.regle.$dirty).toBe(false);
    expect(vm.regle.$error).toBe(false);
    expect(vm.regle.$pending).toBe(false);
    expect(vm.regle.$value).toStrictEqual({
      array0: [],
      nested: {
        array1: null,
      },
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
        $each: [],
      },
      nested: {
        array1: {
          $each: [],
          $errors: ['Value is required'],
        },
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

  it('should update dirty state and errors when pushing values form', async () => {
    vm.regle.$value.array0.push(1);

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
    });

    expect(vm.regle.$fields.array0.$valid).toBe(false);
    expect(vm.regle.$fields.nested.$fields.array1.$valid).toBe(false);

    //

    vm.regle.$value.array0.push(3);
    vm.regle.$value.nested.array1 = ['bar'];

    await nextTick();

    expect(vm.errors.array0.$each).toStrictEqual([['Custom error'], ['Custom error']]);
    expect(vm.errors.array0.$errors).toStrictEqual([]);

    expect(vm.regle.$value.nested).toStrictEqual([]);

    expect(vm.errors.nested.array1.$each).toStrictEqual([['Custom error']]);
  });

  // it('should update dirty state and errors when updating nested properties', async () => {
  //   vm.regle.$value.level1.child = 3;
  //   vm.regle.$value.level1.level2.child = 3;

  //   await nextTick();

  //   expect(vm.errors.level1.child).toStrictEqual(['Custom error']);
  //   expect(vm.errors.level1.level2.child).toStrictEqual(['Custom error']);

  //   expect(vm.invalid).toBe(true);

  //   expect(vm.regle.$anyDirty).toBe(true);
  //   expect(vm.regle.$dirty).toBe(true);
  //   expect(vm.regle.$fields.level1.$dirty).toBe(true);
  //   expect(vm.regle.$fields.level1.$error).toBe(true);
  //   expect(vm.regle.$fields.level1.$fields.child.$dirty).toBe(true);
  //   expect(vm.regle.$fields.level1.$fields.child.$error).toBe(true);
  //   expect(vm.regle.$fields.level1.$fields.level2.$fields.child.$dirty).toBe(true);
  //   expect(vm.regle.$fields.level1.$fields.level2.$fields.child.$error).toBe(true);
  //   expect(vm.regle.$error).toBe(true);
  //   expect(vm.regle.$pending).toBe(false);
  //   expect(vm.regle.$value).toStrictEqual({
  //     level0: 1,
  //     level1: {
  //       child: 3,
  //       level2: {
  //         child: 3,
  //       },
  //     },
  //   });

  //   expect(vm.regle.$fields.level0.$valid).toBe(false);
  //   expect(vm.regle.$fields.level1.$valid).toBe(false);
  //   expect(vm.regle.$fields.level1.$fields.child.$valid).toBe(false);
  //   expect(vm.regle.$fields.level1.$fields.level2.$fields.child.$valid).toBe(false);
  // });

  // it('should remove errors when all values are valid', async () => {
  //   vm.regle.$value.level0 = 2;
  //   vm.regle.$value.level1.child = 2;
  //   vm.regle.$value.level1.level2.child = 2;

  //   await nextTick();

  //   expect(vm.errors.level0).toStrictEqual([]);
  //   expect(vm.errors.level1.child).toStrictEqual([]);
  //   expect(vm.errors.level1.level2.child).toStrictEqual([]);

  //   expect(vm.invalid).toBe(false);

  //   expect(vm.regle.$anyDirty).toBe(true);
  //   expect(vm.regle.$dirty).toBe(true);
  //   expect(vm.regle.$fields.level1.$dirty).toBe(true);
  //   expect(vm.regle.$fields.level1.$error).toBe(false);
  //   expect(vm.regle.$fields.level1.$fields.child.$dirty).toBe(true);
  //   expect(vm.regle.$fields.level1.$fields.child.$error).toBe(false);
  //   expect(vm.regle.$fields.level1.$fields.level2.$fields.child.$dirty).toBe(true);
  //   expect(vm.regle.$fields.level1.$fields.level2.$fields.child.$error).toBe(false);
  //   expect(vm.regle.$error).toBe(false);
  //   expect(vm.regle.$pending).toBe(false);
  //   expect(vm.regle.$value).toStrictEqual({
  //     level0: 2,
  //     level1: {
  //       child: 2,
  //       level2: {
  //         child: 2,
  //       },
  //     },
  //   });

  //   expect(vm.regle.$fields.level0.$valid).toBe(true);
  //   expect(vm.regle.$fields.level0.$valid).toBe(true);
  //   expect(vm.regle.$fields.level1.$valid).toBe(true);
  //   expect(vm.regle.$fields.level1.$fields.child.$valid).toBe(true);
  //   expect(vm.regle.$fields.level1.$fields.level2.$fields.child.$valid).toBe(true);

  //   const result = await vm.validateForm();

  //   expect(result).toStrictEqual({
  //     level0: 2,
  //     level1: {
  //       child: 2,
  //       level2: {
  //         child: 2,
  //       },
  //     },
  //   });
  // });

  // it('should reset on initial state when calling resetForm', async () => {
  //   vm.resetForm();

  //   await flushPromises();

  //   expect(vm.errors).toStrictEqual({
  //     level0: [],
  //     level1: {
  //       child: [],
  //       level2: {
  //         child: [],
  //       },
  //     },
  //   });

  //   expect(vm.invalid).toBe(true);

  //   expect(vm.regle.$anyDirty).toBe(false);
  //   expect(vm.regle.$dirty).toBe(false);
  //   expect(vm.regle.$error).toBe(false);
  //   expect(vm.regle.$pending).toBe(false);
  //   expect(vm.regle.$value).toStrictEqual({
  //     level0: 0,
  //     level1: {
  //       child: 1,
  //       level2: {
  //         child: 2,
  //       },
  //     },
  //   });

  //   expect(vm.regle.$fields.level0.$valid).toBe(true);
  //   expect(vm.regle.$fields.level1.$valid).toBe(false);
  //   expect(vm.regle.$fields.level1.$fields.child.$valid).toBe(false);
  //   expect(vm.regle.$fields.level1.$fields.level2.$fields.child.$valid).toBe(true);
  // });
});
