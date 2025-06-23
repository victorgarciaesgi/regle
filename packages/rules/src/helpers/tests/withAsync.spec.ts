import type { Maybe, RegleRuleDefinition } from '@regle/core';
import { useRegle } from '@regle/core';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import { timeout } from '../../../../../tests/utils';
import { withAsync } from '../withAsync';
import { withMessage } from '../withMessage';

describe('withAsync helper', () => {
  const mountComponent = () => {
    return mount(
      defineComponent({
        setup() {
          const form = ref({
            email: '',
            count: 0,
          });

          return useRegle(form, () => ({
            email: {
              error: withMessage(
                withAsync(
                  async (value) => {
                    await timeout(1000);
                    return form.value.count === 0;
                  },
                  [() => form.value.count]
                ),
                'Error'
              ),
            },
          }));
        },
        template: '<div></div>',
      })
    );
  };

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should return empty errors', () => {
    const wrapper = mountComponent();
    expect(wrapper.vm.r$.$errors.email).toStrictEqual([]);
  });

  it('should be on pending state when changing value', async () => {
    const wrapper = mountComponent();
    wrapper.vm.r$.$value.email = 'f';

    await vi.advanceTimersByTimeAsync(200);
    await nextTick();

    expect(wrapper.vm.r$.$pending).toBe(true);
    expect(wrapper.vm.r$.email.$pending).toBe(true);
    expect(wrapper.vm.r$.email.$pending).toBe(true);

    vi.advanceTimersByTime(1000);
    await nextTick();
    await flushPromises();

    expect(wrapper.vm.r$.$pending).toBe(false);
    expect(wrapper.vm.r$.email.$pending).toBe(false);
    expect(wrapper.vm.r$.email.$pending).toBe(false);
    expect(wrapper.vm.r$.email.$error).toBe(false);
    expect(wrapper.vm.r$.email.$error).toBe(false);
  });

  it('should be on pending state and validate when changing dep', async () => {
    const wrapper = mountComponent();
    wrapper.vm.r$.$value.email = 'f';
    wrapper.vm.r$.$value.count = 1;

    await vi.advanceTimersByTimeAsync(200);
    await nextTick();

    expect(wrapper.vm.r$.$pending).toBe(true);
    expect(wrapper.vm.r$.email.$pending).toBe(true);
    expect(wrapper.vm.r$.email.$pending).toBe(true);

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(wrapper.vm.r$.$pending).toBe(false);
    expect(wrapper.vm.r$.email.$pending).toBe(false);
    expect(wrapper.vm.r$.email.$pending).toBe(false);
    expect(wrapper.vm.r$.email.$rules.error.$valid).toBe(false);
    expect(wrapper.vm.r$.email.$rules.error.$valid).toBe(false);
    expect(wrapper.vm.r$.email.$error).toBe(true);
    expect(wrapper.vm.r$.$errors.email).toStrictEqual(['Error']);
  });

  it('should handle failed promises', async () => {
    const rule = withAsync(async () => {
      try {
        return await new Promise<boolean>((resolve, reject) => {
          reject(false);
        });
      } catch (e) {
        return false;
      }
    });

    expect(await rule.exec(null)).toBe(false);
  });

  it('should have correct types', () => {
    expectTypeOf(
      withAsync(
        async (value) => {
          return true as boolean;
        },
        [() => 0]
      )
    ).toEqualTypeOf<RegleRuleDefinition<unknown, [number], true, boolean, unknown>>();

    expectTypeOf(
      withAsync(async (value) => {
        return true as boolean;
      })
    ).toEqualTypeOf<RegleRuleDefinition<unknown, [], true, boolean, unknown>>();

    const base = ref(1);

    const someAsyncCall = async (param: number) => await Promise.resolve(true);

    const { r$ } = useRegle(
      { name: '' },
      {
        name: {
          customRule: withMessage(
            withAsync(
              async (value, param) => {
                expectTypeOf(value).toExtend<Maybe<string>>();
                expectTypeOf(param).toBeNumber();
                return await someAsyncCall(param);
              },
              [base]
            ),
            ({ $value, $params: [param] }) => `Custom error: ${$value} != ${param}`
          ),
        },
      }
    );

    withMessage(
      withAsync(async (value, param) => ({ $valid: true, foo: 'bar' }), [() => 0]),
      ({ foo, $params }) => {
        expectTypeOf(foo).toEqualTypeOf<string>();
        expectTypeOf($params).toEqualTypeOf<[number]>();
        return '';
      }
    );
  });
});
