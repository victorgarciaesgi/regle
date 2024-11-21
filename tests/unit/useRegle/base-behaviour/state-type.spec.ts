import { flushPromises } from '@vue/test-utils';
import {
  nestedReactiveObjectValidation,
  nestedRefObjectValidation,
  nestedReactiveWithRefsValidation,
  nestedRefObjectValidationComputed,
  nesteObjectWithRefsValidation,
} from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
import { nextTick } from 'vue';
import { shouldBeInvalidField, shouldBePristineField } from '../../../utils/validations.utils';

describe.each([
  ['reactive', nestedReactiveObjectValidation],
  ['ref', nestedRefObjectValidation],
  ['ref state with computed rules', nestedRefObjectValidationComputed],
  ['reactive with ref', nestedReactiveWithRefsValidation],
  ['object with refs state', nesteObjectWithRefsValidation],
])('useRegle with %s', async (title, regle) => {
  const { vm } = await createRegleComponent(regle);

  it('should have a initial state', () => {
    expect(vm.errors).toStrictEqual({
      level0: [],
      level1: {
        child: [],
        level2: {
          child: [],
        },
        collection: {
          $errors: [],
          $each: [{ name: [] }],
        },
      },
    });

    expect(vm.ready).toBe(false);

    shouldBeInvalidField(vm.r$);

    expect(vm.regle.$value).toStrictEqual({
      level0: 0,
      level1: {
        child: 1,
        level2: {
          child: 2,
        },
        collection: [{ name: 0 }],
      },
    });

    shouldBePristineField(vm.regle.$fields.level0);
    shouldBeInvalidField(vm.regle.$fields.level1);
    shouldBeInvalidField(vm.regle.$fields.level1.$fields.child);
    shouldBePristineField(vm.regle.$fields.level1.$fields.level2.$fields.child);
    shouldBePristineField(vm.regle.$fields.level1.$fields.collection.$each[0].$fields.name);
  });

  it('should error on initial submit', async () => {
    const result = await vm.validateState();

    expect(result).toBe(false);
    expect(vm.errors).toStrictEqual({
      level0: [],
      level1: {
        child: ['Custom error'],
        level2: {
          child: [],
        },
        collection: {
          $errors: [],
          $each: [{ name: [] }],
        },
      },
    });

    expect(vm.ready).toBe(false);

    expect(vm.regle.$anyDirty).toBe(true);
    expect(vm.regle.$dirty).toBe(true);
    expect(vm.regle.$error).toBe(true);
    expect(vm.regle.$pending).toBe(false);

    expect(vm.regle.$fields.level0.$valid).toBe(true);
    expect(vm.regle.$fields.level1.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.child.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.child.$valid).toBe(true);
  });

  it('should update dirty state and errors when updating form', async () => {
    vm.regle.$value.level0 = 1;

    await nextTick();

    expect(vm.errors.level0).toStrictEqual(['Custom error']);

    expect(vm.ready).toBe(false);

    expect(vm.regle.$anyDirty).toBe(true);
    expect(vm.regle.$dirty).toBe(true);
    expect(vm.regle.$fields.level0.$dirty).toBe(true);
    expect(vm.regle.$error).toBe(true);
    expect(vm.regle.$fields.level0.$error).toBe(true);
    expect(vm.regle.$pending).toBe(false);
    expect(vm.regle.$value).toStrictEqual({
      level0: 1,
      level1: {
        child: 1,
        level2: {
          child: 2,
        },
        collection: [{ name: 0 }],
      },
    });

    expect(vm.regle.$fields.level0.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.child.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.child.$valid).toBe(true);
  });

  it('should update dirty state and errors when updating nested properties', async () => {
    vm.regle.$value.level1.child = 3;
    vm.regle.$value.level1.level2.child = 3;

    await nextTick();

    expect(vm.errors.level1.child).toStrictEqual(['Custom error']);
    expect(vm.errors.level1.level2.child).toStrictEqual(['Custom error']);

    expect(vm.ready).toBe(false);

    expect(vm.regle.$anyDirty).toBe(true);
    expect(vm.regle.$dirty).toBe(true);
    expect(vm.regle.$fields.level1.$dirty).toBe(true);
    expect(vm.regle.$fields.level1.$error).toBe(true);
    expect(vm.regle.$fields.level1.$fields.child.$dirty).toBe(true);
    expect(vm.regle.$fields.level1.$fields.child.$error).toBe(true);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.child.$dirty).toBe(true);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.child.$error).toBe(true);
    expect(vm.regle.$error).toBe(true);
    expect(vm.regle.$pending).toBe(false);
    expect(vm.regle.$value).toStrictEqual({
      level0: 1,
      level1: {
        child: 3,
        level2: {
          child: 3,
        },
        collection: [{ name: 0 }],
      },
    });

    expect(vm.regle.$fields.level0.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.child.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.child.$valid).toBe(false);
  });

  it('should remove errors when all values are valid', async () => {
    vm.regle.$value.level0 = 2;
    vm.regle.$value.level1.child = 2;
    vm.regle.$value.level1.level2.child = 2;

    await nextTick();

    expect(vm.errors.level0).toStrictEqual([]);
    expect(vm.errors.level1.child).toStrictEqual([]);
    expect(vm.errors.level1.level2.child).toStrictEqual([]);

    expect(vm.ready).toBe(true);

    expect(vm.regle.$anyDirty).toBe(true);
    expect(vm.regle.$dirty).toBe(true);
    expect(vm.regle.$fields.level1.$dirty).toBe(true);
    expect(vm.regle.$fields.level1.$error).toBe(false);
    expect(vm.regle.$fields.level1.$fields.child.$dirty).toBe(true);
    expect(vm.regle.$fields.level1.$fields.child.$error).toBe(false);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.child.$dirty).toBe(true);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.child.$error).toBe(false);
    expect(vm.regle.$error).toBe(false);
    expect(vm.regle.$pending).toBe(false);
    expect(vm.regle.$value).toStrictEqual({
      level0: 2,
      level1: {
        child: 2,
        level2: {
          child: 2,
        },
        collection: [{ name: 0 }],
      },
    });

    expect(vm.regle.$fields.level0.$valid).toBe(true);
    expect(vm.regle.$fields.level0.$valid).toBe(true);
    expect(vm.regle.$fields.level1.$valid).toBe(true);
    expect(vm.regle.$fields.level1.$fields.child.$valid).toBe(true);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.child.$valid).toBe(true);

    const result = await vm.validateState();

    expect(result).toStrictEqual({
      level0: 2,
      level1: {
        child: 2,
        level2: {
          child: 2,
        },
        collection: [{ name: 0 }],
      },
    });
  });

  it('should reset on initial state when calling resetAll', async () => {
    await Promise.all([vm.resetAll(), flushPromises()]);

    await nextTick();

    expect(vm.errors).toStrictEqual({
      level0: [],
      level1: {
        child: [],
        level2: {
          child: [],
        },
        collection: {
          $errors: [],
          $each: [{ name: [] }],
        },
      },
    });

    expect(vm.ready).toBe(false);

    expect(vm.regle.$anyDirty).toBe(false);
    expect(vm.regle.$dirty).toBe(false);
    expect(vm.regle.$error).toBe(false);
    expect(vm.regle.$pending).toBe(false);
    expect(vm.regle.$value).toStrictEqual({
      level0: 0,
      level1: {
        child: 1,
        level2: {
          child: 2,
        },
        collection: [{ name: 0 }],
      },
    });

    expect(vm.regle.$fields.level0.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.child.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.child.$valid).toBe(false);
  });
});
