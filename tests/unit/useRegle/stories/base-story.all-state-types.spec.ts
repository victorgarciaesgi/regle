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
import {
  shouldBeErrorField,
  shouldBeInvalidField,
  shouldBePristineField,
  shouldBeValidField,
} from '../../../utils/validations.utils';

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

    expect(vm.r$.$value).toStrictEqual({
      level0: 0,
      level1: {
        child: 1,
        level2: {
          child: 2,
        },
        collection: [{ name: 0 }],
      },
    });

    shouldBePristineField(vm.r$.$fields.level0);
    shouldBeInvalidField(vm.r$.$fields.level1);
    shouldBeInvalidField(vm.r$.$fields.level1.$fields.child);
    shouldBePristineField(vm.r$.$fields.level1.$fields.level2.$fields.child);
    shouldBePristineField(vm.r$.$fields.level1.$fields.collection.$each[0].$fields.name);
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

    shouldBeErrorField(vm.r$);
    shouldBeValidField(vm.r$.$fields.level0);
    shouldBeErrorField(vm.r$.$fields.level1);
    shouldBeErrorField(vm.r$.$fields.level1.$fields.child);
    shouldBeValidField(vm.r$.$fields.level1.$fields.level2.$fields.child);
    shouldBeValidField(vm.r$.$fields.level1.$fields.collection.$each[0].$fields.name);
  });

  it('should update dirty state and errors when updating form', async () => {
    vm.r$.$value.level0 = 1;
    vm.r$.$value.level1.collection.push({ name: null });

    await nextTick();

    expect(vm.errors.level0).toStrictEqual(['Custom error']);
    expect(vm.errors.level1.collection.$each).toStrictEqual([{ name: [] }, { name: [] }]);

    shouldBeInvalidField(vm.r$.$fields.level1.$fields.collection.$each[1].$fields.name);

    vm.r$.$fields.level1.$fields.collection.$each[1].$fields.name.$touch();
    await nextTick();

    expect(vm.ready).toBe(false);

    shouldBeErrorField(vm.r$);
    shouldBeErrorField(vm.r$.$fields.level0);
    shouldBeErrorField(vm.r$.$fields.level1.$fields.collection.$each[1].$fields.name);

    expect(vm.errors.level1.collection.$each).toStrictEqual([
      { name: [] },
      { name: ['This field is required'] },
    ]);

    expect(vm.r$.$value).toStrictEqual({
      level0: 1,
      level1: {
        child: 1,
        level2: {
          child: 2,
        },
        collection: [{ name: 0 }, { name: null }],
      },
    });

    expect(vm.r$.$fields.level0.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$fields.child.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$fields.level2.$fields.child.$valid).toBe(true);
  });

  it('should update dirty state and errors when updating nested properties', async () => {
    vm.r$.$value.level1.child = 3;
    vm.r$.$value.level1.level2.child = 3;
    vm.r$.$value.level1.collection[1].name = 3;

    await nextTick();

    expect(vm.errors.level1.child).toStrictEqual(['Custom error']);
    expect(vm.errors.level1.level2.child).toStrictEqual(['Custom error']);

    expect(vm.ready).toBe(false);

    shouldBeErrorField(vm.r$);
    shouldBeErrorField(vm.r$.$fields.level1);
    shouldBeErrorField(vm.r$.$fields.level1.$fields.child);
    shouldBeErrorField(vm.r$.$fields.level1.$fields.level2.$fields.child);
    shouldBeErrorField(vm.r$.$fields.level1.$fields.collection.$each[1].$fields.name);

    expect(vm.r$.$value).toStrictEqual({
      level0: 1,
      level1: {
        child: 3,
        level2: {
          child: 3,
        },
        collection: [{ name: 0 }, { name: 3 }],
      },
    });

    expect(vm.r$.$fields.level0.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$fields.child.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$fields.level2.$fields.child.$valid).toBe(false);
  });

  it('should remove errors when all values are valid', async () => {
    vm.r$.$value.level0 = 2;
    vm.r$.$value.level1.child = 2;
    vm.r$.$value.level1.level2.child = 2;
    vm.r$.$value.level1.collection[1].name = 2;

    await nextTick();

    expect(vm.errors.level0).toStrictEqual([]);
    expect(vm.errors.level1.child).toStrictEqual([]);
    expect(vm.errors.level1.level2.child).toStrictEqual([]);
    expect(vm.errors.level1.collection.$each).toStrictEqual([{ name: [] }, { name: [] }]);

    expect(vm.ready).toBe(true);

    shouldBeValidField(vm.r$);
    shouldBeValidField(vm.r$.$fields.level1);
    shouldBeValidField(vm.r$.$fields.level1.$fields.child);
    shouldBeValidField(vm.r$.$fields.level1.$fields.level2.$fields.child);
    shouldBeValidField(vm.r$.$fields.level1.$fields.collection.$each[0].$fields.name);
    shouldBeValidField(vm.r$.$fields.level1.$fields.collection.$each[1].$fields.name);

    expect(vm.r$.$value).toStrictEqual({
      level0: 2,
      level1: {
        child: 2,
        level2: {
          child: 2,
        },
        collection: [{ name: 0 }, { name: 2 }],
      },
    });

    // Remove one item from the list
    vm.r$.$value.level1.collection.splice(0, 1);

    await nextTick();

    expect(vm.errors.level1.collection.$each).toStrictEqual([{ name: [] }]);

    shouldBeValidField(vm.r$.$fields.level1.$fields.collection.$each[0].$fields.name);

    const result = await vm.validateState();

    expect(result).toStrictEqual({
      level0: 2,
      level1: {
        child: 2,
        level2: {
          child: 2,
        },
        collection: [{ name: 2 }],
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

    expect(vm.r$.$anyDirty).toBe(false);
    expect(vm.r$.$dirty).toBe(false);
    expect(vm.r$.$error).toBe(false);
    expect(vm.r$.$pending).toBe(false);
    expect(vm.r$.$value).toStrictEqual({
      level0: 0,
      level1: {
        child: 1,
        level2: {
          child: 2,
        },
        collection: [{ name: 0 }],
      },
    });

    expect(vm.r$.$fields.level0.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$fields.child.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$fields.level2.$fields.child.$valid).toBe(false);
  });
});
