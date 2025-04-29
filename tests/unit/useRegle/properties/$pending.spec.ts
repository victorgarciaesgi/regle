import { flushPromises } from '@vue/test-utils';
import { useRegle } from '@regle/core';
import { ruleMockIsEvenAsync } from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
import { nextTick, ref } from 'vue';
import { shouldBeErrorField, shouldBePristineField, shouldBeValidField } from '../../../utils/validations.utils';

function nestedAsyncObjectWithRefsValidation() {
  const form = ref({
    level0: 0,
    level1: {
      child: 0,
    },
    collection: [{ child: 0 }],
  });

  return useRegle(
    form,
    {
      level0: { ruleEvenAsync: ruleMockIsEvenAsync() },
      level1: {
        child: { ruleEven: ruleMockIsEvenAsync() },
      },
      collection: {
        $each: {
          child: { ruleEvenAsync: ruleMockIsEvenAsync(2000) },
        },
      },
    },
    { lazy: true }
  );
}

describe('$pending', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('sets `$pending` to `true`, when async validators are used and are being resolved', async () => {
    const { vm } = await createRegleComponent(nestedAsyncObjectWithRefsValidation);
    await nextTick();

    shouldBePristineField(vm.r$, true);

    await vi.advanceTimersByTimeAsync(200);
    await nextTick();

    shouldBePristineField(vm.r$, true);

    vm.r$.$value.level0 = 1;
    await vi.advanceTimersByTimeAsync(200);
    await nextTick();

    expect(vm.r$.$fields.level0.$pending).toBe(true);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    shouldBeErrorField(vm.r$.$fields.level0);
    expect(vm.r$.$fields.level0.$errors).toStrictEqual(['Custom error']);

    vm.r$.$value.level0 = 2;
    await vi.advanceTimersByTimeAsync(200);
    await nextTick();

    expect(vm.r$.$fields.level0.$pending).toBe(true);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    shouldBeValidField(vm.r$.$fields.level0);
    expect(vm.r$.$fields.level0.$pending).toBe(false);
    expect(vm.r$.$ready).toBe(true);

    const [{ valid, data }] = await Promise.all([vm.r$.$validate(), vi.advanceTimersByTimeAsync(2300)]);

    expect(vm.r$.$fields.level0.$pending).toBe(false);

    expect(valid).toBe(true);
    expect(data).toStrictEqual({
      level0: 2,
      level1: {
        child: 0,
      },
      collection: [{ child: 0 }],
    });
  });

  it('propagates `$pending` up to the top most parent', async () => {
    const { vm } = await createRegleComponent(nestedAsyncObjectWithRefsValidation);

    vm.r$.$value.level1.child = 1;
    await vi.advanceTimersByTimeAsync(200);
    await nextTick();

    expect(vm.r$.$fields.level1.$fields.child.$pending).toBe(true);
    expect(vm.r$.$fields.level1.$pending).toBe(true);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    shouldBeErrorField(vm.r$.$fields.level1);
    shouldBeErrorField(vm.r$.$fields.level1.$fields.child);
    expect(vm.r$.$fields.level1.$fields.child.$errors).toStrictEqual(['Custom error']);
  });

  it('propagates should make a boolean shift when editing a async rule', async () => {
    const { vm } = await createRegleComponent(nestedAsyncObjectWithRefsValidation);

    expect(vm.r$.$correct).toBe(true);

    vm.r$.$value.level1.child = 1;
    await nextTick();
    expect(vm.r$.$correct).toBe(false);

    await vi.advanceTimersByTimeAsync(200);

    expect(vm.r$.$fields.level1.$fields.child.$pending).toBe(true);
    expect(vm.r$.$fields.level1.$pending).toBe(true);
    expect(vm.r$.$correct).toBe(false);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    shouldBeErrorField(vm.r$.$fields.level1);
    shouldBeErrorField(vm.r$.$fields.level1.$fields.child);
    expect(vm.r$.$fields.level1.$fields.child.$errors).toStrictEqual(['Custom error']);
  });

  it('propagates `$pending` from a collection child', async () => {
    const { vm } = await createRegleComponent(nestedAsyncObjectWithRefsValidation);

    vm.r$.$value.collection[0].child = 1;
    await vi.advanceTimersByTimeAsync(200);
    await nextTick();

    expect(vm.r$.$fields.collection.$each[0].$pending).toBe(true);
    expect(vm.r$.$fields.collection.$pending).toBe(true);

    vi.advanceTimersByTime(2000);
    await flushPromises();

    shouldBeErrorField(vm.r$.$fields.collection.$each[0].$fields.child);
    expect(vm.r$.$fields.collection.$each[0].$fields.child.$errors).toStrictEqual(['Custom error']);
  });

  it('sets `$pending` to false, when the last async invocation resolves', () => {});
});
