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
          $each: [{ name: [], description: [] }],
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
        collection: [{ name: 0, description: '' }],
      },
    });

    shouldBePristineField(vm.r$.level0);
    shouldBeInvalidField(vm.r$.level1);
    shouldBeInvalidField(vm.r$.level1.child);
    shouldBePristineField(vm.r$.level1.level2.child);
    shouldBeInvalidField(vm.r$.level1.collection.$self);
    shouldBePristineField(vm.r$.level1.collection.$each[0].name);
    shouldBeInvalidField(vm.r$.level1.collection.$each[0].description);
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
          $each: [{ name: [], description: ['This field should be at least 4 characters long'] }],
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
      { name: undefined as unknown as number, description: '' },
      { name: undefined as unknown as number, description: '' }
    );

    await nextTick();

    expect(vm.r$.$errors.level0).toStrictEqual(['Custom error']);
    expect(vm.r$.$errors.level1.collection.$each).toStrictEqual([
      { name: [], description: ['This field should be at least 4 characters long'] },
      { name: [], description: [] },
      { name: [], description: [] },
    ]);

    shouldBeInvalidField(vm.r$.level1.collection.$each[1].name);
    shouldBeInvalidField(vm.r$.level1.collection.$each[2].name);
    shouldBeInvalidField(vm.r$.level1.collection.$each[1].description);
    shouldBeInvalidField(vm.r$.level1.collection.$each[2].description);

    vm.r$.level1.collection.$touch();
    await nextTick();

    expect(vm.r$.$ready).toBe(false);

    shouldBeErrorField(vm.r$);
    shouldBeErrorField(vm.r$.level0);
    shouldBeErrorField(vm.r$.level1.collection.$each[1].name);
    shouldBeErrorField(vm.r$.level1.collection.$each[2].name);
    shouldBeErrorField(vm.r$.level1.collection.$each[1].description);
    shouldBeErrorField(vm.r$.level1.collection.$each[2].description);

    expect(vm.r$.$errors.level1.collection.$each).toStrictEqual([
      { name: [], description: ['This field should be at least 4 characters long'] },
      { name: ['This field is required'], description: ['This field should be at least 4 characters long'] },
      { name: ['This field is required'], description: ['This field should be at least 4 characters long'] },
    ]);

    expect(vm.r$.$value).toStrictEqual({
      level0: 1,
      level1: {
        child: 1,
        level2: {
          child: 2,
        },
        collection: [
          { name: 0, description: '' },
          { name: undefined, description: '' },
          { name: undefined, description: '' },
        ],
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
    vm.r$.$value.level1.collection[1].description = 'te';
    vm.r$.$value.level1.collection[2].description = 'te';

    await nextTick();

    expect(vm.r$.$errors.level1.child).toStrictEqual(['Custom error']);
    expect(vm.r$.$errors.level1.level2.child).toStrictEqual(['Custom error']);

    expect(vm.r$.$ready).toBe(false);

    shouldBeErrorField(vm.r$);
    shouldBeErrorField(vm.r$.level1);
    shouldBeErrorField(vm.r$.level1.child);
    shouldBeErrorField(vm.r$.level1.level2.child);
    shouldBeErrorField(vm.r$.level1.collection.$each[1].name);
    shouldBeErrorField(vm.r$.level1.collection.$each[2].name);
    shouldBeErrorField(vm.r$.level1.collection.$each[1].description);
    shouldBeErrorField(vm.r$.level1.collection.$each[2].description);

    expect(vm.r$.$value).toStrictEqual({
      level0: 1,
      level1: {
        child: 3,
        level2: {
          child: 3,
        },
        collection: [
          { name: 0, description: '' },
          { name: 3, description: 'te' },
          { name: 3, description: 'te' },
        ],
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
    vm.r$.$value.level1.collection[0].description = 'test';
    vm.r$.$value.level1.collection[1].description = 'test';
    vm.r$.$value.level1.collection[2].description = 'test';

    await nextTick();

    expect(vm.r$.$errors.level0).toStrictEqual([]);
    expect(vm.r$.$errors.level1.child).toStrictEqual([]);
    expect(vm.r$.$errors.level1.level2.child).toStrictEqual([]);
    expect(vm.r$.$errors.level1.collection.$each).toStrictEqual([
      { name: [], description: [] },
      { name: [], description: [] },
      { name: [], description: [] },
    ]);

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
    shouldBeValidField(vm.r$.level1.collection.$each[0].description);
    shouldBeValidField(vm.r$.level1.collection.$each[1].description);
    shouldBeValidField(vm.r$.level1.collection.$each[2].description);

    expect(vm.r$.$value).toStrictEqual({
      level0: 2,
      level1: {
        child: 2,
        level2: {
          child: 2,
        },
        collection: [
          { name: 0, description: 'test' },
          { name: 2, description: 'test' },
          { name: 2, description: 'test' },
        ],
      },
    });

    // Remove one item from the list
    vm.r$.$value.level1.collection.splice(0, 1);

    await nextTick();

    expect(vm.r$.$errors.level1.collection.$each).toStrictEqual([
      { name: [], description: [] },
      { name: [], description: [] },
    ]);

    shouldBeValidField(vm.r$.level1.collection.$each[0].name);
    shouldBeValidField(vm.r$.level1.collection.$each[0].description);
    shouldBeValidField(vm.r$.level1.collection.$each[1].name);
    shouldBeValidField(vm.r$.level1.collection.$each[1].description);

    vm.r$.$value.level1.collection.push({ name: 2, description: 'test' });
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
        collection: [
          { name: 2, description: 'test' },
          { name: 2, description: 'test' },
          { name: 2, description: 'test' },
        ],
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
          $each: [{ name: [], description: [] }],
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
        collection: [{ name: 0, description: '' }],
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
