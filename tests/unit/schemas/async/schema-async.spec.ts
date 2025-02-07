import { flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { valibotAsyncSchemaFixture } from './fixtures/valibot.fixture';
import { zodAsyncSchemaFixture } from './fixtures/zod.fixture';

describe.each([
  ['valibot', valibotAsyncSchemaFixture],
  ['zod', zodAsyncSchemaFixture],
])('schema (%s) - useRegleSchema with async rules and Object refs', async (name, regleSchema) => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  const { vm } = createRegleComponent(regleSchema);

  it('should have a initial state', () => {
    expect(vm.r$.$errors).toStrictEqual({
      level0Async: [],
      level1: {
        child: [],
        level2: {
          childAsync: [],
        },
      },
    });

    expect(vm.r$.$ready).toBe(false);

    expect(vm.r$.$anyDirty).toBe(false);
    expect(vm.r$.$dirty).toBe(false);
    expect(vm.r$.$error).toBe(false);
    expect(vm.r$.$pending).toBe(false);
    expect(vm.r$.$value).toStrictEqual({
      level0Async: 0,
      level1: {
        child: 1,
        level2: {
          childAsync: '',
        },
      },
    });

    expect(vm.r$.$fields.level0Async.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$fields.child.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$fields.level2.$fields.childAsync.$valid).toBe(false);
  });

  it('should error on initial submit', async () => {
    const [{ result }] = await Promise.all([vm.r$.$validate(), vi.advanceTimersByTimeAsync(1300)]);
    await nextTick();

    expect(result).toBe(false);
    expect(vm.r$.$errors).toStrictEqual({
      level0Async: [],
      level1: {
        child: ['Custom error'],
        level2: {
          childAsync: [],
        },
      },
    });

    expect(vm.r$.$ready).toBe(false);

    expect(vm.r$.$anyDirty).toBe(true);
    expect(vm.r$.$dirty).toBe(true);
    expect(vm.r$.$error).toBe(true);
    expect(vm.r$.$pending).toBe(false);

    expect(vm.r$.$fields.level0Async.$valid).toBe(true);
    expect(vm.r$.$fields.level1.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$fields.child.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$fields.level2.$fields.childAsync.$valid).toBe(false);
  });

  it('should update dirty state and errors when updating form', async () => {
    vm.r$.$value.level0Async = 1;

    await vi.advanceTimersByTimeAsync(200);
    await nextTick();
    // @ts-expect-error no nested $pending in schema mode
    expect(vm.r$.$fields.level0Async.$pending).toBe(false);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(vm.r$.$errors.level0Async).toStrictEqual(['Custom error']);

    expect(vm.r$.$ready).toBe(false);

    expect(vm.r$.$anyDirty).toBe(true);
    expect(vm.r$.$dirty).toBe(true);
    expect(vm.r$.$fields.level0Async.$dirty).toBe(true);
    expect(vm.r$.$error).toBe(true);
    expect(vm.r$.$fields.level0Async.$error).toBe(true);
    expect(vm.r$.$pending).toBe(false);
    expect(vm.r$.$value).toStrictEqual({
      level0Async: 1,
      level1: {
        child: 1,
        level2: {
          childAsync: '',
        },
      },
    });

    expect(vm.r$.$fields.level0Async.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$fields.child.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$fields.level2.$fields.childAsync.$valid).toBe(false);
  });

  it('should update dirty state and errors when updating nested properties', async () => {
    vm.r$.$value.level1.child = 3;
    vm.r$.$value.level1.level2.childAsync = 'bar';

    await vi.advanceTimersByTimeAsync(200);
    await nextTick();
    // TODO can't do $pending
    // expect(vm.r$.$pending).toBe(true);

    await nextTick();

    vi.advanceTimersByTime(1000);
    await nextTick();
    await flushPromises();

    expect(vm.r$.$errors.level1.child).toStrictEqual(['Custom error']);
    expect(vm.r$.$errors.level1.level2.childAsync).toStrictEqual(['Custom error']);

    expect(vm.r$.$ready).toBe(false);

    expect(vm.r$.$anyDirty).toBe(true);
    expect(vm.r$.$dirty).toBe(true);
    expect(vm.r$.$fields.level1.$dirty).toBe(true);
    expect(vm.r$.$fields.level1.$error).toBe(true);
    expect(vm.r$.$fields.level1.$fields.child.$dirty).toBe(true);
    expect(vm.r$.$fields.level1.$fields.child.$error).toBe(true);
    expect(vm.r$.$fields.level1.$fields.level2.$fields.childAsync.$dirty).toBe(true);
    expect(vm.r$.$fields.level1.$fields.level2.$fields.childAsync.$error).toBe(true);
    expect(vm.r$.$error).toBe(true);
    expect(vm.r$.$pending).toBe(false);
    expect(vm.r$.$value).toStrictEqual({
      level0Async: 1,
      level1: {
        child: 3,
        level2: {
          childAsync: 'bar',
        },
      },
    });

    expect(vm.r$.$fields.level0Async.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$fields.child.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$fields.level2.$fields.childAsync.$valid).toBe(false);
  });

  it('should remove errors when all values are valid', async () => {
    vm.r$.$value.level0Async = 2;
    vm.r$.$value.level1.child = 2;
    vm.r$.$value.level1.level2.childAsync = 'foo';

    await vi.advanceTimersByTimeAsync(200);
    await nextTick();
    // TODO can't do $pending
    // expect(vm.r$.$pending).toBe(true);

    await vi.advanceTimersByTimeAsync(1000);
    await nextTick();
    await flushPromises();

    expect(vm.r$.$errors.level0Async).toStrictEqual([]);
    expect(vm.r$.$errors.level1.child).toStrictEqual([]);
    expect(vm.r$.$errors.level1.level2.childAsync).toStrictEqual([]);

    expect(vm.r$.$ready).toBe(true);

    expect(vm.r$.$anyDirty).toBe(true);
    expect(vm.r$.$dirty).toBe(true);
    expect(vm.r$.$fields.level1.$dirty).toBe(true);
    expect(vm.r$.$fields.level1.$error).toBe(false);
    expect(vm.r$.$fields.level1.$fields.child.$dirty).toBe(true);
    expect(vm.r$.$fields.level1.$fields.child.$error).toBe(false);
    expect(vm.r$.$fields.level1.$fields.level2.$fields.childAsync.$dirty).toBe(true);
    expect(vm.r$.$fields.level1.$fields.level2.$fields.childAsync.$error).toBe(false);
    expect(vm.r$.$error).toBe(false);

    expect(vm.r$.$pending).toBe(false);
    expect(vm.r$.$value).toStrictEqual({
      level0Async: 2,
      level1: {
        child: 2,
        level2: {
          childAsync: 'foo',
        },
      },
    });

    expect(vm.r$.$fields.level0Async.$valid).toBe(true);
    expect(vm.r$.$fields.level0Async.$valid).toBe(true);
    expect(vm.r$.$fields.level1.$valid).toBe(true);
    expect(vm.r$.$fields.level1.$fields.child.$valid).toBe(true);
    expect(vm.r$.$fields.level1.$fields.level2.$fields.childAsync.$valid).toBe(true);
    expect(vm.r$.$fields.level1.$fields.level2.$fields.childAsync.$error).toBe(false);

    const [{ result, data }] = await Promise.all([vm.r$.$validate(), vi.advanceTimersByTimeAsync(1300)]);

    await nextTick();

    expect(result).toBe(true);
    expect(data).toStrictEqual({
      level0Async: 2,
      level1: {
        child: 2,
        level2: {
          childAsync: 'foo',
        },
      },
    });
  });

  it('should reset on initial state when calling r$.$resetAll', async () => {
    vm.r$.$resetAll();

    await nextTick();

    expect(vm.r$.$errors).toStrictEqual({
      level0Async: [],
      level1: {
        child: [],
        level2: {
          childAsync: [],
        },
      },
    });

    expect(vm.r$.$ready).toBe(false);

    expect(vm.r$.$anyDirty).toBe(false);
    expect(vm.r$.$dirty).toBe(false);
    expect(vm.r$.$error).toBe(false);
    expect(vm.r$.$pending).toBe(false);
    expect(vm.r$.$value).toStrictEqual({
      level0Async: 0,
      level1: {
        child: 1,
        level2: {
          childAsync: '',
        },
      },
    });

    expect(vm.r$.$fields.level0Async.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$fields.child.$valid).toBe(false);
    expect(vm.r$.$fields.level1.$fields.level2.$fields.childAsync.$valid).toBe(false);
  });
});
