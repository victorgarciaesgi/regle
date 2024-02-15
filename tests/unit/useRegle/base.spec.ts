import { flushPromises } from '@vue/test-utils';
import { nestedReactiveObjectValidation } from '../../fixtures';
import { createRegleComponent } from '../../utils/test.utils';
import { nextTick } from 'vue';

describe('useRegle', async () => {
  const { vm } = createRegleComponent(nestedReactiveObjectValidation);

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

    expect(vm.regle.$fields.level0.$valid).toBe(true);
    expect(vm.regle.$fields.level1.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.child.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.child.$valid).toBe(true);
  });

  it('should error on initial submit', async () => {
    const result = await vm.validateForm();

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
    vm.form.level0 = 1;

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
    vm.form.level1.child = 3;
    vm.form.level1.level2.child = 3;

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
    vm.form.level0 = 2;
    vm.form.level1.child = 2;
    vm.form.level1.level2.child = 2;

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

    const result = await vm.validateForm();

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

  it('should reset on initial state when calling resetForm', async () => {
    vm.resetForm();

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

    expect(vm.regle.$fields.level0.$valid).toBe(true);
    expect(vm.regle.$fields.level1.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.child.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.child.$valid).toBe(true);
  });
});
