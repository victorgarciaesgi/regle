import { flushPromises } from '@vue/test-utils';
import { useRegle } from '@regle/core';
import { ruleMockIsEvenAsync, ruleMockIsEven, ruleMockIsFooAsync } from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
import { nextTick, ref } from 'vue';

function nestedAsyncObjectWithRefsValidation() {
  const form = {
    level0Async: ref(0),
    level1: {
      child: ref(1),
      level2: {
        childAsync: ref(''),
      },
    },
  };

  return useRegle(form, () => ({
    level0Async: { ruleEvenAsync: ruleMockIsEvenAsync() },
    level1: {
      child: { ruleEven: ruleMockIsEven },
      level2: {
        childAsync: { ruleAsync: ruleMockIsFooAsync() },
      },
    },
  }));
}

describe('useRegle with async rules and Object refs', async () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  const { vm } = createRegleComponent(nestedAsyncObjectWithRefsValidation);

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

    expect(vm.r$.level0Async.$correct).toBe(false);
    expect(vm.r$.level0Async.$correct).toBe(false);
    expect(vm.r$.level1.$correct).toBe(false);
    expect(vm.r$.level1.child.$correct).toBe(false);
    expect(vm.r$.level1.level2.childAsync.$correct).toBe(false);
  });

  it('should error on initial submit', async () => {
    const [{ valid }] = await Promise.all([vm.r$.$validate(), vi.advanceTimersByTimeAsync(1300)]);
    await nextTick();

    expect(valid).toBe(false);
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

    expect(vm.r$.level0Async.$correct).toBe(true);
    expect(vm.r$.level1.$correct).toBe(false);
    expect(vm.r$.level1.child.$correct).toBe(false);
    expect(vm.r$.level1.level2.childAsync.$correct).toBe(false);
  });

  it('should update dirty state and errors when updating form', async () => {
    vm.r$.$value.level0Async = 1;

    await vi.advanceTimersByTimeAsync(200);
    await nextTick();
    expect(vm.r$.level0Async.$pending).toBe(true);
    expect(vm.r$.level0Async.$pending).toBe(true);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(vm.r$.$errors.level0Async).toStrictEqual(['Custom error']);

    expect(vm.r$.$ready).toBe(false);

    expect(vm.r$.$anyDirty).toBe(true);
    expect(vm.r$.$dirty).toBe(true);
    expect(vm.r$.level0Async.$dirty).toBe(true);
    expect(vm.r$.$error).toBe(true);
    expect(vm.r$.level0Async.$error).toBe(true);
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

    expect(vm.r$.level0Async.$correct).toBe(false);
    expect(vm.r$.level1.$correct).toBe(false);
    expect(vm.r$.level1.child.$correct).toBe(false);
    expect(vm.r$.level1.level2.childAsync.$correct).toBe(false);
  });

  it('should update dirty state and errors when updating nested properties', async () => {
    vm.r$.$value.level1.child = 3;
    vm.r$.$value.level1.level2.childAsync = 'bar';

    await vi.advanceTimersByTimeAsync(200);
    await nextTick();
    expect(vm.r$.$pending).toBe(true);

    await nextTick();

    vi.advanceTimersByTime(1000);
    await nextTick();
    await flushPromises();

    expect(vm.r$.$errors.level1.child).toStrictEqual(['Custom error']);
    expect(vm.r$.$errors.level1.level2.childAsync).toStrictEqual(['Custom error']);

    expect(vm.r$.$ready).toBe(false);

    expect(vm.r$.$anyDirty).toBe(true);
    expect(vm.r$.$dirty).toBe(true);
    expect(vm.r$.level1.$dirty).toBe(true);
    expect(vm.r$.level1.$error).toBe(true);
    expect(vm.r$.level1.child.$dirty).toBe(true);
    expect(vm.r$.level1.child.$error).toBe(true);
    expect(vm.r$.level1.level2.childAsync.$dirty).toBe(true);
    expect(vm.r$.level1.level2.childAsync.$error).toBe(true);
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

    expect(vm.r$.level0Async.$correct).toBe(false);
    expect(vm.r$.level1.$correct).toBe(false);
    expect(vm.r$.level1.child.$correct).toBe(false);
    expect(vm.r$.level1.level2.childAsync.$correct).toBe(false);
  });

  it('should remove errors when all values are valid', async () => {
    vm.r$.$value.level0Async = 2;
    vm.r$.$value.level1.child = 2;
    vm.r$.$value.level1.level2.childAsync = 'foo';

    await vi.advanceTimersByTimeAsync(200);
    await nextTick();
    expect(vm.r$.$pending).toBe(true);

    await vi.advanceTimersByTimeAsync(1000);
    await nextTick();
    await flushPromises();

    expect(vm.r$.$errors.level0Async).toStrictEqual([]);
    expect(vm.r$.$errors.level1.child).toStrictEqual([]);
    expect(vm.r$.$errors.level1.level2.childAsync).toStrictEqual([]);

    expect(vm.r$.$ready).toBe(true);

    expect(vm.r$.$anyDirty).toBe(true);
    expect(vm.r$.$dirty).toBe(true);
    expect(vm.r$.level1.$dirty).toBe(true);
    expect(vm.r$.level1.$error).toBe(false);
    expect(vm.r$.level1.child.$dirty).toBe(true);
    expect(vm.r$.level1.child.$error).toBe(false);
    expect(vm.r$.level1.level2.childAsync.$dirty).toBe(true);
    expect(vm.r$.level1.level2.childAsync.$error).toBe(false);
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

    expect(vm.r$.level0Async.$correct).toBe(true);
    expect(vm.r$.level0Async.$correct).toBe(true);
    expect(vm.r$.level1.$correct).toBe(true);
    expect(vm.r$.level1.child.$correct).toBe(true);
    expect(vm.r$.level1.level2.childAsync.$correct).toBe(true);
    expect(vm.r$.level1.level2.childAsync.$error).toBe(false);

    const [{ valid, data }] = await Promise.all([vm.r$.$validate(), vi.advanceTimersByTimeAsync(1300)]);

    await nextTick();

    expect(valid).toBe(true);
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

  it('should reset on initial state when calling r$.$reset({toInitialState: true})', async () => {
    vm.r$.$reset({ toInitialState: true });

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

    expect(vm.r$.level0Async.$correct).toBe(false);
    expect(vm.r$.level1.$correct).toBe(false);
    expect(vm.r$.level1.child.$correct).toBe(false);
    expect(vm.r$.level1.level2.childAsync.$correct).toBe(false);
  });
});
