import type { Maybe, RegleRuleDefinition } from '@regle/core';
import { InternalRuleType, RegleVuePlugin, createRule, useRegle } from '@regle/core';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import { timeout } from '../../../../../tests/utils';
import { withAsync } from '../withAsync';
import { withMessage } from '../withMessage';
import { minLength } from '../../rules';

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
                  async (_value) => {
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
      }),
      {
        global: {
          plugins: [RegleVuePlugin],
        },
      }
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

    vi.advanceTimersByTime(1000);
    await nextTick();
    await flushPromises();

    expect(wrapper.vm.r$.$pending).toBe(false);
    expect(wrapper.vm.r$.email.$pending).toBe(false);
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

    vi.advanceTimersByTime(1000);
    await flushPromises();

    expect(wrapper.vm.r$.$pending).toBe(false);
    expect(wrapper.vm.r$.email.$pending).toBe(false);
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
      } catch {
        return false;
      }
    });

    expect(await rule.exec(null)).toBe(false);
  });

  it('should wrap raw rule objects', async () => {
    expect(() => withAsync(minLength(2) as any)).toThrowError();
  });

  it('should fallback to async type and empty params for rule defs', async () => {
    const customRule = createRule({
      type: 'custom',
      validator(value: unknown, min: number) {
        return Number(value) >= min;
      },
      message: 'Error',
    });

    customRule._type = undefined as any;
    customRule._params = undefined as any;

    const wrappedRule = withAsync(customRule as any, []);

    expect(wrappedRule.type).toBe(InternalRuleType.Async);
    expect(await wrappedRule.exec(2)).toBe(false);
  });

  it('should have correct types', () => {
    expectTypeOf(
      withAsync(
        async (_value) => {
          return true as boolean;
        },
        [() => 0]
      )
    ).toEqualTypeOf<RegleRuleDefinition<unknown, unknown, [number], true, boolean, unknown>>();

    expectTypeOf(
      withAsync(async () => {
        return true as boolean;
      })
    ).toEqualTypeOf<RegleRuleDefinition<unknown, unknown, [], true, boolean, unknown>>();

    const base = ref(1);

    const someAsyncCall = async (_param: number) => await Promise.resolve(true);

    useRegle(
      { name: '' },
      {
        name: {
          customRule: withMessage(
            withAsync(
              async (value: Maybe<string>, param) => {
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
      withAsync(async (_value, _param) => ({ $valid: true, foo: 'bar' }), [() => 0]),
      ({ foo, $params }) => {
        expectTypeOf(foo).toEqualTypeOf<string>();
        expectTypeOf($params).toEqualTypeOf<[number]>();
        return '';
      }
    );
  });
});
