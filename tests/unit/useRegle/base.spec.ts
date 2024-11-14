import { flushPromises } from '@vue/test-utils';
import {
  nestedReactiveObjectValidation,
  nestedRefObjectValidation,
  nestedReactiveWithRefsValidation,
  nestedRefObjectValidationComputed,
} from '../../fixtures';
import { createRegleComponent } from '../../utils/test.utils';
import { nextTick } from 'vue';

describe.each([
  ['reactive', nestedReactiveObjectValidation],
  ['ref', nestedRefObjectValidation],
  ['ref state with computed rules', nestedRefObjectValidationComputed],
  ['reactive with ref', nestedReactiveWithRefsValidation],
])('useRegle with %s', async (title, regle) => {
  const { vm } = createRegleComponent(regle);

  it('should have a initial state', () => {
    expect(vm.errors).toStrictEqual({
      level0: [],
      level1: {
        child: [],
        level2: {
          child: [],
        },
      },
    });

    expect(vm.invalid).toBe(true);

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
      },
    });

    expect(vm.regle.$fields.level0.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.child.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.child.$valid).toBe(false);
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
      },
    });

    expect(vm.invalid).toBe(true);

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

    expect(vm.invalid).toBe(true);

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

    expect(vm.invalid).toBe(true);

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

    expect(vm.invalid).toBe(false);

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
      },
    });
  });

  it('should reset on initial state when calling resetAll', async () => {
    vm.resetAll();

    await flushPromises();

    expect(vm.errors).toStrictEqual({
      level0: [],
      level1: {
        child: [],
        level2: {
          child: [],
        },
      },
    });

    expect(vm.invalid).toBe(true);

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
      },
    });

    expect(vm.regle.$fields.level0.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.child.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.child.$valid).toBe(false);
  });
});
