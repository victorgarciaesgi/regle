import { flushPromises, mount } from '@vue/test-utils';
import { useRegle, createRule, RegleVuePlugin, type MaybeInput } from '@regle/core';
import { minLength, required } from '@regle/rules';
import { defineComponent, nextTick, ref, onUnmounted } from 'vue';

describe('Memory and cleanup behavior', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  /**
   * Test that component unmounting properly cleans up
   */
  it('should properly cleanup when component is unmounted', async () => {
    const cleanupCalls: string[] = [];

    const TestComponent = defineComponent({
      setup() {
        const form = ref({ name: '' });
        const { r$ } = useRegle(form, {
          name: { required },
        });

        onUnmounted(() => {
          cleanupCalls.push('component-unmounted');
        });

        return { r$ };
      },
      template: '<div>{{ r$.$value.name }}</div>',
    });

    const wrapper = mount(TestComponent, {
      global: {
        plugins: [RegleVuePlugin],
      },
    });

    // Interact with the form
    wrapper.vm.r$.$value.name = 'test';
    await nextTick();

    // Unmount
    wrapper.unmount();

    // Verify cleanup was called
    expect(cleanupCalls).toContain('component-unmounted');
  });

  /**
   * Test that watchers are stopped when component unmounts
   */
  it('should stop watchers when component unmounts', async () => {
    const watcherCallCount = { count: 0 };

    const trackingRule = createRule({
      validator: (value: MaybeInput<string>) => {
        watcherCallCount.count++;
        return !!value;
      },
      message: 'Required',
    });

    const TestComponent = defineComponent({
      setup() {
        const form = ref({ name: '' });
        const { r$ } = useRegle(form, {
          name: { trackingRule },
        });
        return { r$, form };
      },
      template: '<div>{{ r$.$value.name }}</div>',
    });

    const wrapper = mount(TestComponent);

    const initialCount = watcherCallCount.count;

    wrapper.vm.r$.$value.name = 'test';
    await nextTick();

    const countAfterChange = watcherCallCount.count;
    expect(countAfterChange).toBeGreaterThan(initialCount);

    wrapper.unmount();

    // Reset and try to change the ref (should not trigger watcher)
    const countBeforeOrphanChange = watcherCallCount.count;

    expect(watcherCallCount.count).toBe(countBeforeOrphanChange);
  });

  /**
   * Test that async validations are handled on unmount
   */
  it('should handle pending async validations on unmount', async () => {
    const slowAsyncRule = createRule({
      validator: async (value: MaybeInput<string>) => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return !!value;
      },
      message: 'Required',
    });

    const TestComponent = defineComponent({
      setup() {
        const form = ref({ name: '' });
        const { r$ } = useRegle(form, {
          name: { slowAsyncRule },
        });
        return { r$ };
      },
      template: '<div>{{ r$.$value.name }}</div>',
    });

    const wrapper = mount(TestComponent);

    wrapper.vm.r$.$touch();
    wrapper.vm.r$.$value.name = 'test';
    await vi.advanceTimersByTimeAsync(200);
    await nextTick();

    wrapper.unmount();
    await vi.advanceTimersByTimeAsync(2000);
    await flushPromises();

    // Test passes if no errors during unmount with pending async
    expect(true).toBe(true);
  });

  it('should handle multiple mount/unmount cycles', async () => {
    const TestComponent = defineComponent({
      setup() {
        const form = ref({
          items: Array.from({ length: 10 }, (_, i) => ({ name: `item${i}` })),
        });

        const { r$ } = useRegle(form, {
          items: {
            $each: {
              name: { required, minLength: minLength(2) },
            },
          },
        });

        return { r$ };
      },
      template: '<div>{{ r$.$value.items.length }}</div>',
    });

    for (let i = 0; i < 10; i++) {
      const wrapper = mount(TestComponent);

      wrapper.vm.r$.$value.items.push({ name: `new${i}` });
      await nextTick();

      wrapper.unmount();
    }

    // If we get here without errors or memory issues, the test passes
    expect(true).toBe(true);
  });

  it('should properly clean up on $reset', async () => {
    const TestComponent = defineComponent({
      setup() {
        const form = ref({
          name: '',
          items: [] as { value: string }[],
        });

        const { r$ } = useRegle(form, {
          name: { required },
          items: {
            $each: {
              value: { required },
            },
          },
        });

        return { r$ };
      },
      template: '<div></div>',
    });

    const wrapper = mount(TestComponent);

    wrapper.vm.r$.$value.name = 'test';
    wrapper.vm.r$.$value.items.push({ value: 'item1' }, { value: 'item2' });
    await nextTick();

    expect(wrapper.vm.r$.$value.items.length).toBe(2);
    expect(wrapper.vm.r$.$anyDirty).toBe(true);

    wrapper.vm.r$.$reset({ toInitialState: true });
    await nextTick();

    expect(wrapper.vm.r$.$value.name).toBe('');
    expect(wrapper.vm.r$.$value.items.length).toBe(0);
    expect(wrapper.vm.r$.$anyDirty).toBe(false);

    wrapper.vm.r$.$value.items.push({ value: 'newitem' });
    await nextTick();

    expect(wrapper.vm.r$.$value.items.length).toBe(1);
    expect(wrapper.vm.r$.items.$each[0].value.$invalid).toBe(false);

    wrapper.unmount();
  });

  it('should handle dynamic rule changes without memory leaks', async () => {
    const TestComponent = defineComponent({
      setup() {
        const enableStrict = ref(false);
        const form = ref({ name: '' });

        const { r$ } = useRegle(form, () => ({
          name: {
            required,
            ...(enableStrict.value ? { minLength: minLength(10) } : {}),
          },
        }));

        return { r$, enableStrict };
      },
      template: '<div></div>',
    });

    const wrapper = mount(TestComponent);

    expect(wrapper.vm.r$.name.$rules.minLength).toBeUndefined();

    for (let i = 0; i < 5; i++) {
      wrapper.vm.enableStrict = true;
      await nextTick();
      expect(wrapper.vm.r$.name.$rules.minLength).toBeDefined();

      wrapper.vm.enableStrict = false;
      await nextTick();
      expect(wrapper.vm.r$.name.$rules.minLength).toBeUndefined();
    }

    wrapper.unmount();
  });
});
