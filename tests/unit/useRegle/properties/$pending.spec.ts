import { flushPromises } from '@vue/test-utils';
import { useRegle } from '@regle/core';
import { ruleMockIsEvenAsync, ruleMockIsEven, ruleMockIsFooAsync } from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
import { nextTick, ref } from 'vue';
import {
  shouldBeErrorField,
  shouldBeInvalidField,
  shouldBePristineField,
} from '../../../utils/validations.utils';

function nesteAsyncObjectWithRefsValidation() {
  const form = ref({
    level0: 0,
    level1: {
      child: 0,
    },
    collection: [{ child: 0 }],
  });

  return useRegle(form, {
    level0: { ruleEvenAsync: ruleMockIsEvenAsync() },
    level1: {
      child: { ruleEven: ruleMockIsEven },
    },
    collection: {
      $each: {
        child: { ruleEvenAsync: ruleMockIsEvenAsync() },
      },
    },
  });
}

describe('$pending', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('sets `$pending` to `true`, when async validators are used and are being resolved', async () => {
    const { vm } = await createRegleComponent(nesteAsyncObjectWithRefsValidation);

    shouldBePristineField(vm.r$);

    await vi.advanceTimersByTimeAsync(100);
    await nextTick();

    shouldBePristineField(vm.r$);

    vm.r$.$value.level0 = 1;
    await vi.advanceTimersByTimeAsync(100);
    await nextTick();

    expect(vm.r$.$fields.level0.$pending).toBe(true);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    shouldBeErrorField(vm.r$.$fields.level0);
  });

  it('propagates `$pending` up to the top most parent', () => {});

  it('sets `$pending` to false, when the last async invocation resolves', () => {});
});
