import { flushPromises } from '@vue/test-utils';
import { useRegle, createRule } from '@regle/core';
import { minLength, required } from '@regle/rules';
import { nextTick, ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import type { Maybe } from '@regle/core';

describe('Rapid value changes and debouncing', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('should handle rapid synchronous value changes', async () => {
    const validatorCallCount = { count: 0 };

    const countingRule = createRule({
      validator: (value: Maybe<string>) => {
        validatorCallCount.count++;
        return !!value && value.length >= 3;
      },
      message: 'Must be at least 3 characters',
    });

    function rapidChangesValidation() {
      const form = ref({ name: '' });
      return useRegle(form, {
        name: { countingRule },
      });
    }

    const { vm } = createRegleComponent(rapidChangesValidation);

    validatorCallCount.count = 0;

    for (let i = 0; i < 10; i++) {
      vm.r$.$value.name = 'a'.repeat(i + 1);
    }

    await nextTick();

    expect(validatorCallCount.count).toBeLessThanOrEqual(10);
  });

  it('should debounce async validations', async () => {
    const asyncCallCount = { count: 0 };

    const asyncRule = createRule({
      validator: async (value: Maybe<string>) => {
        asyncCallCount.count++;
        await new Promise((resolve) => setTimeout(resolve, 100));
        return value === 'valid';
      },
      message: 'Invalid value',
    });

    function asyncDebounceValidation() {
      const form = ref({ name: '' });
      return useRegle(form, {
        name: { asyncRule },
      });
    }

    const { vm } = createRegleComponent(asyncDebounceValidation);

    asyncCallCount.count = 0;

    vm.r$.$touch();

    vm.r$.$value.name = 'a';
    await vi.advanceTimersByTimeAsync(50); // Less than debounce time

    vm.r$.$value.name = 'ab';
    await vi.advanceTimersByTimeAsync(50);

    vm.r$.$value.name = 'abc';
    await vi.advanceTimersByTimeAsync(50);

    vm.r$.$value.name = 'valid';

    // Wait for debounce and async completion
    await vi.advanceTimersByTimeAsync(300);
    await flushPromises();

    expect(asyncCallCount.count).toBeLessThan(5);
  });

  it('should maintain consistent state during rapid changes', async () => {
    function consistentStateValidation() {
      const form = ref({ name: '' });
      return useRegle(form, {
        name: { required, minLength: minLength(3) },
      });
    }

    const { vm } = createRegleComponent(consistentStateValidation);

    vm.r$.$touch();
    await nextTick();

    const values = ['a', 'ab', 'abc', 'abcd', 'abcde'];
    for (const value of values) {
      vm.r$.$value.name = value;
    }
    await nextTick();

    expect(vm.r$.$value.name).toBe('abcde');
    expect(vm.r$.name.$invalid).toBe(false);

    // Rapid changes back to invalid
    vm.r$.$value.name = 'x';
    await nextTick();

    expect(vm.r$.name.$invalid).toBe(true);
  });

  it('should handle rapid collection modifications', async () => {
    function collectionValidation() {
      const form = ref({
        items: [] as { name: string }[],
      });

      return useRegle(form, {
        items: {
          $each: {
            name: { required },
          },
        },
      });
    }

    const { vm } = createRegleComponent(collectionValidation);

    // Rapid additions
    const startTime = performance.now();
    for (let i = 0; i < 50; i++) {
      vm.r$.$value.items.push({ name: `item${i}` });
    }
    await nextTick();
    const addTime = performance.now() - startTime;

    // Should handle 50 rapid additions reasonably (< 500ms)
    expect(addTime).toBeLessThan(500);
    expect(vm.r$.$value.items.length).toBe(50);

    // Rapid removals
    const removeStart = performance.now();
    while (vm.r$.$value.items.length > 0) {
      vm.r$.$value.items.pop();
    }
    await nextTick();
    const removeTime = performance.now() - removeStart;

    // Should handle rapid removals reasonably (< 500ms)
    expect(removeTime).toBeLessThan(500);
    expect(vm.r$.$value.items.length).toBe(0);
  });

  /**
   * Test that pending state is correctly managed during rapid async changes
   */
  it('should correctly manage pending state during rapid async changes', async () => {
    const asyncRule = createRule({
      validator: async (value: Maybe<string>) => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return !!value && value.length >= 3;
      },
      message: 'Too short',
    });

    function pendingStateValidation() {
      const form = ref({ name: '' });
      return useRegle(form, {
        name: { asyncRule },
      });
    }

    const { vm } = createRegleComponent(pendingStateValidation);

    vm.r$.$touch();

    // Start async validation by changing value
    vm.r$.$value.name = 'abc';

    // Wait past the debounce time (150ms default) to allow async to start
    await vi.advanceTimersByTimeAsync(200);
    await nextTick();

    // Should be pending now
    expect(vm.r$.name.$pending).toBe(true);

    // Complete the async operation
    await vi.advanceTimersByTimeAsync(200);
    await flushPromises();

    // Should no longer be pending
    expect(vm.r$.name.$pending).toBe(false);
    expect(vm.r$.name.$invalid).toBe(false);
  });
});
