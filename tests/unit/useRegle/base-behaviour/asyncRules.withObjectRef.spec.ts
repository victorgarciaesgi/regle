import { flushPromises } from '@vue/test-utils';
import { useRegle } from '@regle/core';
import { ruleMockIsEvenAsync, ruleMockIsEven, ruleMockIsFooAsync } from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
import { nextTick, ref } from 'vue';

function nesteAsyncObjectWithRefsValidation() {
  const form = {
    level0Async: ref(0),
    level1: {
      child: ref(1),
      level2: {
        childAsync: ref(''),
      },
    },
  };

  return {
    form,
    ...useRegle(form, () => ({
      level0Async: { ruleEvenAsync: ruleMockIsEvenAsync() },
      level1: {
        child: { ruleEven: ruleMockIsEven },
        level2: {
          childAsync: { ruleAsync: ruleMockIsFooAsync() },
        },
      },
    })),
  };
}

describe('useRegle with async rules and Object refs', async () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  const { vm } = createRegleComponent(nesteAsyncObjectWithRefsValidation);

  it('should have a initial state', () => {
    expect(vm.errors).toStrictEqual({
      level0Async: [],
      level1: {
        child: [],
        level2: {
          childAsync: [],
        },
      },
    });

    expect(vm.ready).toBe(false);

    expect(vm.regle.$anyDirty).toBe(false);
    expect(vm.regle.$dirty).toBe(false);
    expect(vm.regle.$error).toBe(false);
    expect(vm.regle.$pending).toBe(false);
    expect(vm.regle.$value).toStrictEqual({
      level0Async: 0,
      level1: {
        child: 1,
        level2: {
          childAsync: '',
        },
      },
    });

    expect(vm.regle.$fields.level0Async.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.child.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.childAsync.$valid).toBe(false);
  });

  it('should error on initial submit', async () => {
    const [result] = await Promise.all([vm.validateState(), vi.advanceTimersByTimeAsync(1000)]);

    await nextTick();
    await flushPromises();

    expect(result).toBe(false);
    expect(vm.errors).toStrictEqual({
      level0Async: [],
      level1: {
        child: ['Custom error'],
        level2: {
          childAsync: [],
        },
      },
    });

    expect(vm.ready).toBe(false);

    expect(vm.regle.$anyDirty).toBe(true);
    expect(vm.regle.$dirty).toBe(true);
    expect(vm.regle.$error).toBe(true);
    expect(vm.regle.$pending).toBe(false);

    expect(vm.regle.$fields.level0Async.$valid).toBe(true);
    expect(vm.regle.$fields.level1.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.child.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.childAsync.$valid).toBe(false);
  });

  it('should update dirty state and errors when updating form', async () => {
    vm.regle.$value.level0Async = 1;
    await nextTick();
    vi.advanceTimersByTimeAsync(1000);
    await nextTick();
    await flushPromises();

    expect(vm.errors.level0Async).toStrictEqual(['Custom error']);

    expect(vm.ready).toBe(false);

    expect(vm.regle.$anyDirty).toBe(true);
    expect(vm.regle.$dirty).toBe(true);
    expect(vm.regle.$fields.level0Async.$dirty).toBe(true);
    expect(vm.regle.$error).toBe(true);
    expect(vm.regle.$fields.level0Async.$error).toBe(true);
    expect(vm.regle.$pending).toBe(false);
    expect(vm.regle.$value).toStrictEqual({
      level0Async: 1,
      level1: {
        child: 1,
        level2: {
          childAsync: '',
        },
      },
    });

    expect(vm.regle.$fields.level0Async.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.child.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.childAsync.$valid).toBe(false);
  });

  it('should update dirty state and errors when updating nested properties', async () => {
    vm.regle.$value.level1.child = 3;
    vm.regle.$value.level1.level2.childAsync = 'bar';

    await nextTick();

    vi.advanceTimersByTime(1000);
    await nextTick();
    await flushPromises();

    expect(vm.errors.level1.child).toStrictEqual(['Custom error']);
    expect(vm.errors.level1.level2.childAsync).toStrictEqual(['Custom error']);

    expect(vm.ready).toBe(false);

    expect(vm.regle.$anyDirty).toBe(true);
    expect(vm.regle.$dirty).toBe(true);
    expect(vm.regle.$fields.level1.$dirty).toBe(true);
    expect(vm.regle.$fields.level1.$error).toBe(true);
    expect(vm.regle.$fields.level1.$fields.child.$dirty).toBe(true);
    expect(vm.regle.$fields.level1.$fields.child.$error).toBe(true);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.childAsync.$dirty).toBe(true);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.childAsync.$error).toBe(true);
    expect(vm.regle.$error).toBe(true);
    expect(vm.regle.$pending).toBe(false);
    expect(vm.regle.$value).toStrictEqual({
      level0Async: 1,
      level1: {
        child: 3,
        level2: {
          childAsync: 'bar',
        },
      },
    });

    expect(vm.regle.$fields.level0Async.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.child.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.childAsync.$valid).toBe(false);
  });

  it.only('should remove errors when all values are valid', async () => {
    vm.regle.$value.level0Async = 2;
    vm.regle.$value.level1.child = 2;
    vm.regle.$value.level1.level2.childAsync = 'foo';

    await nextTick();

    vi.advanceTimersByTime(1000);
    await nextTick();
    await flushPromises();

    expect(vm.errors.level0Async).toStrictEqual([]);
    expect(vm.errors.level1.child).toStrictEqual([]);
    expect(vm.errors.level1.level2.childAsync).toStrictEqual([]);

    expect(vm.ready).toBe(true);

    expect(vm.regle.$anyDirty).toBe(true);
    expect(vm.regle.$dirty).toBe(true);
    expect(vm.regle.$fields.level1.$dirty).toBe(true);
    expect(vm.regle.$fields.level1.$error).toBe(false);
    expect(vm.regle.$fields.level1.$fields.child.$dirty).toBe(true);
    expect(vm.regle.$fields.level1.$fields.child.$error).toBe(false);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.childAsync.$dirty).toBe(true);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.childAsync.$error).toBe(false);
    expect(vm.regle.$error).toBe(false);
    expect(vm.regle.$pending).toBe(false);
    expect(vm.regle.$value).toStrictEqual({
      level0Async: 2,
      level1: {
        child: 2,
        level2: {
          childAsync: 'foo',
        },
      },
    });

    expect(vm.regle.$fields.level0Async.$valid).toBe(true);
    expect(vm.regle.$fields.level0Async.$valid).toBe(true);
    expect(vm.regle.$fields.level1.$valid).toBe(true);
    expect(vm.regle.$fields.level1.$fields.child.$valid).toBe(true);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.childAsync.$valid).toBe(true);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.childAsync.$error).toBe(false);

    const [result] = await Promise.all([vm.validateState(), vi.advanceTimersByTimeAsync(1000)]);

    expect(result).toStrictEqual({
      level0Async: 2,
      level1: {
        child: 2,
        level2: {
          childAsync: 'foo',
        },
      },
    });
  });

  it('should reset on initial state when calling resetAll', async () => {
    vm.resetAll();

    vi.advanceTimersByTime(1000);
    await nextTick();
    await flushPromises();

    expect(vm.errors).toStrictEqual({
      level0Async: [],
      level1: {
        child: [],
        level2: {
          childAsync: [],
        },
      },
    });

    expect(vm.ready).toBe(false);

    expect(vm.regle.$anyDirty).toBe(false);
    expect(vm.regle.$dirty).toBe(false);
    expect(vm.regle.$error).toBe(false);
    expect(vm.regle.$pending).toBe(false);
    expect(vm.regle.$value).toStrictEqual({
      level0Async: 0,
      level1: {
        child: 1,
        level2: {
          childAsync: '',
        },
      },
    });

    expect(vm.regle.$fields.level0Async.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.child.$valid).toBe(false);
    expect(vm.regle.$fields.level1.$fields.level2.$fields.childAsync.$valid).toBe(false);
  });
});
