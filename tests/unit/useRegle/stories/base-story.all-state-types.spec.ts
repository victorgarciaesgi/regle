import { nextTick } from 'vue';
import {
  nestedReactiveObjectValidation,
  nestedReactiveWithRefsValidation,
  nestedRefObjectValidation,
  nestedRefObjectValidationComputed,
  nestedObjectWithRefsValidation,
} from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
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
  ['object with refs state', nestedObjectWithRefsValidation],
])('useRegle with %s', async (title, regle) => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const { vm } = createRegleComponent(regle);

  it('should have a initial state', () => {
    expect(vm.r$.$errors).toStrictEqual({
      level0: [],
      level0Boolean: [],
      level1: {
        child: [],
        level2: {
          child: [],
        },
        collection: {
          $self: [],
          $each: [{ name: [] }],
        },
      },
    });

    expect(vm.r$.$ready).toBe(false);

    shouldBeInvalidField(vm.r$);

    expect(vm.r$.$value).toStrictEqual({
      level0: 0,
      level0Boolean: null,
      level1: {
        child: 1,
        level2: {
          child: 2,
        },
        collection: [{ name: 0 }],
      },
    });

    shouldBePristineField(vm.r$.level0);
    shouldBeInvalidField(vm.r$.level0Boolean);
    shouldBeInvalidField(vm.r$.level1);
    shouldBeInvalidField(vm.r$.level1.child);
    shouldBePristineField(vm.r$.level1.level2.child);
    shouldBePristineField(vm.r$.level1.collection.$each[0].name);
  });

  it('should error on initial submit', async () => {
    const [{ valid }] = await Promise.all([vm.r$.$validate(), vi.advanceTimersByTimeAsync(200)]);

    expect(valid).toBe(false);
    expect(vm.r$.$errors).toStrictEqual({
      level0: [],
      level0Boolean: ['The field must be checked'],
      level1: {
        child: ['Custom error'],
        level2: {
          child: [],
        },
        collection: {
          $self: [],
          $each: [{ name: [] }],
        },
      },
    });

    expect(vm.r$.$ready).toBe(false);

    shouldBeErrorField(vm.r$);
    shouldBeValidField(vm.r$.level0);
    shouldBeErrorField(vm.r$.level0Boolean);
    shouldBeErrorField(vm.r$.level1);
    shouldBeErrorField(vm.r$.level1.child);
    shouldBeValidField(vm.r$.level1.level2.child);
    shouldBeValidField(vm.r$.level1.collection.$each[0].name);
  });

  it('should update dirty state and errors when updating form', async () => {
    vm.r$.$value.level0 = 1;
    vm.r$.$value.level0Boolean = false;
    vm.r$.$value.level1.collection.push({ name: null });

    await nextTick();

    expect(vm.r$.$errors.level0).toStrictEqual(['Custom error']);
    expect(vm.r$.$errors.level0Boolean).toStrictEqual(['The field must be checked']);
    expect(vm.r$.$errors.level1.collection.$each).toStrictEqual([{ name: [] }, { name: [] }]);

    shouldBeInvalidField(vm.r$.level1.collection.$each[1].name);

    vm.r$.level1.collection.$each[1].name.$touch();
    await nextTick();

    expect(vm.r$.$ready).toBe(false);

    shouldBeErrorField(vm.r$);
    shouldBeErrorField(vm.r$.level0);
    shouldBeErrorField(vm.r$.level1.collection.$each[1].name);

    expect(vm.r$.$errors.level1.collection.$each).toStrictEqual([{ name: [] }, { name: ['This field is required'] }]);

    expect(vm.r$.$value).toStrictEqual({
      level0: 1,
      level0Boolean: false,
      level1: {
        child: 1,
        level2: {
          child: 2,
        },
        collection: [{ name: 0 }, { name: null }],
      },
    });

    expect(vm.r$.level0.$correct).toBe(false);
    expect(vm.r$.level1.$correct).toBe(false);
    expect(vm.r$.level1.child.$correct).toBe(false);
    expect(vm.r$.level1.level2.child.$correct).toBe(true);
  });

  it('should update dirty state and errors when updating nested properties', async () => {
    vm.r$.$value.level1.child = 3;
    vm.r$.$value.level1.level2.child = 3;
    vm.r$.$value.level1.collection[1].name = 3;

    await nextTick();

    expect(vm.r$.$errors.level1.child).toStrictEqual(['Custom error']);
    expect(vm.r$.$errors.level1.level2.child).toStrictEqual(['Custom error']);

    expect(vm.r$.$ready).toBe(false);

    shouldBeErrorField(vm.r$);
    shouldBeErrorField(vm.r$.level1);
    shouldBeErrorField(vm.r$.level1.child);
    shouldBeErrorField(vm.r$.level1.level2.child);
    shouldBeErrorField(vm.r$.level1.collection.$each[1].name);

    expect(vm.r$.$value).toStrictEqual({
      level0: 1,
      level0Boolean: false,
      level1: {
        child: 3,
        level2: {
          child: 3,
        },
        collection: [{ name: 0 }, { name: 3 }],
      },
    });

    expect(vm.r$.level0.$correct).toBe(false);
    expect(vm.r$.level1.$correct).toBe(false);
    expect(vm.r$.level1.child.$correct).toBe(false);
    expect(vm.r$.level1.level2.child.$correct).toBe(false);
  });

  it('should remove errors when all values are valid', async () => {
    vm.r$.$value.level0 = 2;
    vm.r$.$value.level0Boolean = true;
    vm.r$.$value.level1.child = 2;
    vm.r$.$value.level1.level2.child = 2;
    vm.r$.$value.level1.collection[1].name = 2;

    await nextTick();

    expect(vm.r$.$errors.level0).toStrictEqual([]);
    expect(vm.r$.$errors.level0Boolean).toStrictEqual([]);
    expect(vm.r$.$errors.level1.child).toStrictEqual([]);
    expect(vm.r$.$errors.level1.level2.child).toStrictEqual([]);
    expect(vm.r$.$errors.level1.collection.$each).toStrictEqual([{ name: [] }, { name: [] }]);

    expect(vm.r$.$ready).toBe(true);

    shouldBeValidField(vm.r$);
    shouldBeValidField(vm.r$.level0);
    shouldBeValidField(vm.r$.level0Boolean);
    shouldBeValidField(vm.r$.level1);
    shouldBeValidField(vm.r$.level1.child);
    shouldBeValidField(vm.r$.level1.level2);
    shouldBeValidField(vm.r$.level1.level2.child);
    shouldBeValidField(vm.r$.level1.collection.$each[0].name);
    shouldBeValidField(vm.r$.level1.collection.$each[1].name);

    expect(vm.r$.$value).toStrictEqual({
      level0: 2,
      level0Boolean: true,
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

    expect(vm.r$.$errors.level1.collection.$each).toStrictEqual([{ name: [] }]);

    shouldBeValidField(vm.r$.level1.collection.$each[0].name);

    const [{ valid, data }] = await Promise.all([vm.r$.$validate(), vi.advanceTimersByTimeAsync(200)]);

    expect(valid).toBe(true);
    expect(data).toStrictEqual({
      level0: 2,
      level0Boolean: true,
      level1: {
        child: 2,
        level2: {
          child: 2,
        },
        collection: [{ name: 2 }],
      },
    });
  });

  it('should reset on initial state when calling r$.$reset({toInitialState: true})', async () => {
    vm.r$.$reset({ toInitialState: true });

    await nextTick();

    expect(vm.r$.$errors).toStrictEqual({
      level0: [],
      level0Boolean: [],
      level1: {
        child: [],
        level2: {
          child: [],
        },
        collection: {
          $self: [],
          $each: [{ name: [] }],
        },
      },
    });

    expect(vm.r$.level0Boolean.$dirty).toBe(false);
    expect(vm.r$.$ready).toBe(false);

    expect(vm.r$.level1.collection.$anyDirty).toBe(false);
    expect(vm.r$.$anyDirty).toBe(false);
    expect(vm.r$.$dirty).toBe(false);
    expect(vm.r$.$error).toBe(false);
    expect(vm.r$.$pending).toBe(false);
    expect(vm.r$.$value).toStrictEqual({
      level0: 0,
      level0Boolean: null,
      level1: {
        child: 1,
        level2: {
          child: 2,
        },
        collection: [{ name: 0 }],
      },
    });

    expect(vm.r$.level0.$correct).toBe(false);
    expect(vm.r$.level0Boolean.$correct).toBe(false);
    expect(vm.r$.level1.$correct).toBe(false);
    expect(vm.r$.level1.child.$correct).toBe(false);
    expect(vm.r$.level1.level2.child.$correct).toBe(false);
  });
});
