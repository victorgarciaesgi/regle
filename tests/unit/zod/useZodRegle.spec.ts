import { useZodRegle } from '@regle/zod';
import { nextTick, reactive } from 'vue';
import { createRegleComponent } from '../../utils/test.utils';
import {
  shouldBeErrorField,
  shouldBeInvalidField,
  shouldBePristineField,
  shouldBeValidField,
} from '../../utils/validations.utils';
import { z } from 'zod';
import { isFilled } from '@regle/rules';

function nestedReactiveObjectValidation() {
  const form = reactive({
    level0: 0,
    level1: {
      child: 1,
      level2: {
        child: 2,
      },
      collection: [{ name: 0 as number | null }],
    },
  });

  const zodIsEven = z
    .number({
      required_error: 'This field is required',
      invalid_type_error: 'This field is required',
    })
    .refine(
      (value) => {
        if (isFilled(value)) {
          return value % 2 === 0;
        }
        return true;
      },
      { message: 'Custom error' }
    )
    .default(0);

  return useZodRegle(
    form,
    z.object({
      level0: zodIsEven.optional(),
      level1: z.object({
        child: zodIsEven.optional(),
        level2: z.object({
          child: zodIsEven.optional(),
        }),
        collection: z
          .array(z.object({ name: zodIsEven }))
          .min(3)
          .default([]),
      }),
    })
  );
}

describe('useZodRegle ', async () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const { vm } = createRegleComponent(nestedReactiveObjectValidation);

  it('should have a initial state', () => {
    expect(vm.r$.$errors).toStrictEqual({
      level0: [],
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
    shouldBeInvalidField(vm.r$.$fields.level1.$fields.collection.$field);
    shouldBePristineField(vm.r$.$fields.level1.$fields.collection.$each[0].$fields.name);
  });

  it('should error on initial submit', async () => {
    const [{ result }] = await Promise.all([vm.r$.$validate(), vi.advanceTimersByTimeAsync(200)]);

    expect(result).toBe(false);
    expect(vm.r$.$errors).toStrictEqual({
      level0: [],
      level1: {
        child: ['Custom error'],
        level2: {
          child: [],
        },
        collection: {
          $self: ['This list should have at least 3 items'],
          $each: [{ name: [] }],
        },
      },
    });

    expect(vm.r$.$ready).toBe(false);

    shouldBeErrorField(vm.r$);
    shouldBeValidField(vm.r$.$fields.level0);
    shouldBeErrorField(vm.r$.$fields.level1);
    shouldBeErrorField(vm.r$.$fields.level1.$fields.child);
    shouldBeValidField(vm.r$.$fields.level1.$fields.level2.$fields.child);
    shouldBeValidField(vm.r$.$fields.level1.$fields.collection.$each[0].$fields.name);
  });

  it('should update dirty state and errors when updating form', async () => {
    vm.r$.$value.level0 = 1;
    vm.r$.$value.level1.collection.push({ name: null }, { name: null });

    await nextTick();

    expect(vm.r$.$errors.level0).toStrictEqual(['Custom error']);
    expect(vm.r$.$errors.level1.collection.$each).toStrictEqual([{ name: [] }, { name: [] }, { name: [] }]);

    shouldBeInvalidField(vm.r$.$fields.level1.$fields.collection.$each[1].$fields.name);
    shouldBeInvalidField(vm.r$.$fields.level1.$fields.collection.$each[2].$fields.name);

    vm.r$.$fields.level1.$fields.collection.$touch();
    await nextTick();

    expect(vm.r$.$ready).toBe(false);

    shouldBeErrorField(vm.r$);
    shouldBeErrorField(vm.r$.$fields.level0);
    shouldBeErrorField(vm.r$.$fields.level1.$fields.collection.$each[1].$fields.name);
    shouldBeErrorField(vm.r$.$fields.level1.$fields.collection.$each[2].$fields.name);

    expect(vm.r$.$errors.level1.collection.$each).toStrictEqual([
      { name: [] },
      { name: ['This field is required'] },
      { name: ['This field is required'] },
    ]);

    expect(vm.r$.$value).toStrictEqual({
      level0: 1,
      level1: {
        child: 1,
        level2: {
          child: 2,
        },
        collection: [{ name: 0 }, { name: null }, { name: null }],
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
    vm.r$.$value.level1.collection[2].name = 3;

    await nextTick();

    expect(vm.r$.$errors.level1.child).toStrictEqual(['Custom error']);
    expect(vm.r$.$errors.level1.level2.child).toStrictEqual(['Custom error']);

    expect(vm.r$.$ready).toBe(false);

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
        collection: [{ name: 0 }, { name: 3 }, { name: 3 }],
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
    vm.r$.$value.level1.collection[2].name = 2;

    await nextTick();

    expect(vm.r$.$errors.level0).toStrictEqual([]);
    expect(vm.r$.$errors.level1.child).toStrictEqual([]);
    expect(vm.r$.$errors.level1.level2.child).toStrictEqual([]);
    expect(vm.r$.$errors.level1.collection.$each).toStrictEqual([{ name: [] }, { name: [] }, { name: [] }]);

    expect(vm.r$.$ready).toBe(true);

    shouldBeValidField(vm.r$);
    shouldBeValidField(vm.r$.$fields.level0);
    shouldBeValidField(vm.r$.$fields.level1);
    shouldBeValidField(vm.r$.$fields.level1.$fields.child);
    shouldBeValidField(vm.r$.$fields.level1.$fields.level2);
    shouldBeValidField(vm.r$.$fields.level1.$fields.level2.$fields.child);
    shouldBeValidField(vm.r$.$fields.level1.$fields.collection.$each[0].$fields.name);
    shouldBeValidField(vm.r$.$fields.level1.$fields.collection.$each[1].$fields.name);
    shouldBeValidField(vm.r$.$fields.level1.$fields.collection.$each[2].$fields.name);

    expect(vm.r$.$value).toStrictEqual({
      level0: 2,
      level1: {
        child: 2,
        level2: {
          child: 2,
        },
        collection: [{ name: 0 }, { name: 2 }, { name: 2 }],
      },
    });

    // Remove one item from the list
    vm.r$.$value.level1.collection.splice(0, 1);

    await nextTick();

    expect(vm.r$.$errors.level1.collection.$each).toStrictEqual([{ name: [] }, { name: [] }]);

    shouldBeValidField(vm.r$.$fields.level1.$fields.collection.$each[0].$fields.name);

    vm.r$.$value.level1.collection.push({ name: 2 });
    await nextTick();
    vm.r$.$fields.level1.$fields.collection.$each[2].$fields.name.$touch();

    const [{ result, data }] = await Promise.all([vm.r$.$validate(), vi.advanceTimersByTimeAsync(200)]);

    expect(result).toBe(true);
    expect(data).toStrictEqual({
      level0: 2,
      level1: {
        child: 2,
        level2: {
          child: 2,
        },
        collection: [{ name: 2 }, { name: 2 }, { name: 2 }],
      },
    });
  });

  it('should reset on initial state when calling r$.$resetAll', async () => {
    vm.r$.$resetAll();

    await nextTick();

    expect(vm.r$.$errors).toStrictEqual({
      level0: [],
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
