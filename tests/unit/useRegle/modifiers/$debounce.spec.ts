import { flushPromises, mount } from '@vue/test-utils';
import type { Maybe } from '@regle/core';
import { createRule, defineRegleConfig, defineRegleOptions, RegleVuePlugin, useRegle } from '@regle/core';
import { isFilled } from '@regle/rules';
import { defineComponent, ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { timeout } from '../../../utils';

function countingAsyncRule() {
  const callCount = { value: 0 };
  const rule = createRule({
    async validator(value: Maybe<string>) {
      if (!isFilled(value)) {
        return true;
      }
      callCount.value++;
      await timeout(10);
      return value === 'valid';
    },
    message: 'Invalid value',
  });
  return { rule, callCount };
}

describe('debounce global modifier', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('delays async rule execution by the global `debounce` declared on `useRegle`', async () => {
    const { rule, callCount } = countingAsyncRule();

    const { vm } = createRegleComponent(() => useRegle(ref({ name: '' }), { name: { rule } }, { debounce: 500 }));

    vm.r$.$value.name = 'foo';

    await vi.advanceTimersByTimeAsync(400);
    await flushPromises();
    expect(callCount.value).toBe(0);

    await vi.advanceTimersByTimeAsync(150);
    await flushPromises();
    expect(callCount.value).toBe(1);
    expect(vm.r$.name.$error).toBe(true);
  });

  it('delays async rule execution by the global `debounce` declared on `defineRegleConfig`', async () => {
    const { rule, callCount } = countingAsyncRule();

    const { useRegle: useCustomRegle } = defineRegleConfig({
      modifiers: { debounce: 500 },
    });

    const { vm } = createRegleComponent(() => useCustomRegle(ref({ name: '' }), { name: { rule } }));

    vm.r$.$value.name = 'foo';

    await vi.advanceTimersByTimeAsync(400);
    await flushPromises();
    expect(callCount.value).toBe(0);

    await vi.advanceTimersByTimeAsync(150);
    await flushPromises();
    expect(callCount.value).toBe(1);
  });

  it('delays async rule execution by the global `debounce` declared on `defineRegleOptions`', async () => {
    const { rule, callCount } = countingAsyncRule();

    const options = defineRegleOptions({
      modifiers: { debounce: 500 },
    });

    const component = defineComponent({
      setup() {
        return useRegle(ref({ name: '' }), { name: { rule } });
      },
      template: '<div></div>',
    });

    const { vm } = mount(component, {
      global: {
        plugins: [[RegleVuePlugin, options]],
      },
    });

    vm.r$.$value.name = 'foo';

    await vi.advanceTimersByTimeAsync(400);
    await flushPromises();
    expect(callCount.value).toBe(0);

    await vi.advanceTimersByTimeAsync(150);
    await flushPromises();
    expect(callCount.value).toBe(1);
  });

  it('lets the local `$debounce` take priority over the global `debounce`', async () => {
    const { rule, callCount } = countingAsyncRule();

    const { vm } = createRegleComponent(() =>
      useRegle(ref({ name: '' }), { name: { rule, $debounce: 0 } }, { debounce: 500 })
    );

    vm.r$.$value.name = 'foo';

    await vi.advanceTimersByTimeAsync(20);
    await flushPromises();
    expect(callCount.value).toBe(1);
  });
});
