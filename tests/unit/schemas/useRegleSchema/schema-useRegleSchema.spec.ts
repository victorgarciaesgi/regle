import { computed, nextTick, ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import {
  shouldBeErrorField,
  shouldBeInvalidField,
  shouldBePristineField,
  shouldBeValidField,
} from '../../../utils/validations.utils';
import { valibotNestedRegleFixture } from './fixtures/valibot.fixture';
import { zodNestedRegleFixture } from './fixtures/zod.fixture';
import { z } from 'zod/v3';
import { inferSchema } from '@regle/schemas';
import { zod4NestedRegleFixture } from './fixtures/zod4.fixture';

describe.each([
  ['valibot', valibotNestedRegleFixture],
  ['zod', zodNestedRegleFixture],
  ['zod4', zod4NestedRegleFixture],
  // ['arktype', arktypeNestedRegleFixture],
])('schemas (%s) - useRegleSchema ', async (name, regleSchema) => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const { vm } = createRegleComponent(regleSchema);

  vm.r$.$validate;

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

    shouldBePristineField(vm.r$.level0);
    shouldBeInvalidField(vm.r$.level1);
    shouldBeInvalidField(vm.r$.level1.child);
    shouldBePristineField(vm.r$.level1.level2.child);
    shouldBeInvalidField(vm.r$.level1.collection.$self);
    shouldBePristineField(vm.r$.level1.collection.$each[0].name);
  });

  it('should error on initial submit', async () => {
    const [{ valid }] = await Promise.all([vm.r$.$validate(), vi.advanceTimersByTimeAsync(200)]);

    expect(valid).toBe(false);
    expect(vm.r$.$errors).toStrictEqual({
      level0: [],
      level1: {
        child: ['Custom error'],
        level2: {
          child: [],
        },
        collection: {
          $self: ['Array must contain at least 3 element(s)'],
          $each: [{ name: [] }],
        },
      },
    });

    expect(vm.r$.$ready).toBe(false);

    shouldBeErrorField(vm.r$);
    shouldBeValidField(vm.r$.level0);
    shouldBeErrorField(vm.r$.level1);
    shouldBeErrorField(vm.r$.level1.child);
    shouldBeValidField(vm.r$.level1.level2.child);
    shouldBeValidField(vm.r$.level1.collection.$each[0].name);
  });

  it('should update dirty state and errors when updating form', async () => {
    vm.r$.$value.level0 = 1;
    vm.r$.$value.level1.collection.push(
      { name: undefined as unknown as number },
      { name: undefined as unknown as number }
    );

    await nextTick();

    expect(vm.r$.$errors.level0).toStrictEqual(['Custom error']);
    expect(vm.r$.$errors.level1.collection.$each).toStrictEqual([{ name: [] }, { name: [] }, { name: [] }]);

    shouldBeInvalidField(vm.r$.level1.collection.$each[1].name);
    shouldBeInvalidField(vm.r$.level1.collection.$each[2].name);

    vm.r$.level1.collection.$touch();
    await nextTick();

    expect(vm.r$.$ready).toBe(false);

    shouldBeErrorField(vm.r$);
    shouldBeErrorField(vm.r$.level0);
    shouldBeErrorField(vm.r$.level1.collection.$each[1].name);
    shouldBeErrorField(vm.r$.level1.collection.$each[2].name);

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
        collection: [{ name: 0 }, { name: undefined }, { name: undefined }],
      },
    });

    expect(vm.r$.level0?.$correct).toBe(false);
    expect(vm.r$.level1.$correct).toBe(false);
    expect(vm.r$.level1.child?.$correct).toBe(false);
    expect(vm.r$.level1.level2.child?.$correct).toBe(true);
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
    shouldBeErrorField(vm.r$.level1);
    shouldBeErrorField(vm.r$.level1.child);
    shouldBeErrorField(vm.r$.level1.level2.child);
    shouldBeErrorField(vm.r$.level1.collection.$each[1].name);

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

    expect(vm.r$.level0?.$correct).toBe(false);
    expect(vm.r$.level1.$correct).toBe(false);
    expect(vm.r$.level1?.child?.$correct).toBe(false);
    expect(vm.r$.level1.level2.child?.$correct).toBe(false);
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
    shouldBeValidField(vm.r$.level0);
    shouldBeValidField(vm.r$.level1);
    shouldBeValidField(vm.r$.level1.child);
    shouldBeValidField(vm.r$.level1.level2);
    shouldBeValidField(vm.r$.level1.level2.child);
    shouldBeValidField(vm.r$.level1.collection.$each[0].name);
    shouldBeValidField(vm.r$.level1.collection.$each[1].name);
    shouldBeValidField(vm.r$.level1.collection.$each[2].name);

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

    shouldBeValidField(vm.r$.level1.collection.$each[0].name);

    vm.r$.$value.level1.collection.push({ name: 2 });
    await nextTick();
    vm.r$.level1.collection.$each[2].name.$touch();

    const [{ valid, data }] = await Promise.all([vm.r$.$validate(), vi.advanceTimersByTimeAsync(200)]);

    expect(valid).toBe(true);
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

  it('should reset on initial state when calling r$.$reset({toInitialState: true})', async () => {
    vm.r$.$reset({ toInitialState: true });

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

    // @ts-expect-error Type shouldn't exist in schema mode
    expect(vm.r$.level1.$pending).toBe(false);

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

    expect(vm.r$.level0?.$correct).toBe(false);
    expect(vm.r$.level1.$correct).toBe(false);
    expect(vm.r$.level1.child?.$correct).toBe(false);
    expect(vm.r$.level1.level2.child?.$correct).toBe(false);
  });

  it('inferSchemas should have correct types', () => {
    const formState = ref<{
      firstName: string;
    }>();
    const schema = z.object({
      firstName: z.string().nonempty(),
    });

    const computedRules = computed(() => inferSchema(formState, schema));

    expect(computedRules.value).toStrictEqual(schema);
  });
});
