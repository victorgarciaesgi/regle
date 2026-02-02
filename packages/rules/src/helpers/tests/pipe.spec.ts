import { useRegle, type Maybe } from '@regle/core';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, nextTick } from 'vue';
import { email, minLength, required, withAsync } from '../..';
import { timeout } from '../../../../../tests/utils';
import { pipe } from '../pipe';

describe('pipe', () => {
  beforeEach(() => {
    vi.resetAllMocks();

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return an object', () => {
    // @ts-expect-error - no arguments
    pipe();

    const result = pipe(minLength(3), email);
    expect(result).toBeInstanceOf(Object);
  });

  const emailValidatorMock = vi.fn((value) => email.exec(value));
  email.validator = emailValidatorMock;

  const requiredValidatorMock = vi.fn((value) => required.exec(value));
  required.validator = requiredValidatorMock;

  const minLengthRule = minLength(3);
  const minLengthMock = vi.fn((value) => minLengthRule.exec(value));
  minLengthRule.validator = minLengthMock;

  it('should return an object with the correct keys', () => {
    const result = pipe(minLength(3), email);
    expect(Object.keys(result)).toEqual(['minLength', 'email', '$debounce']);
  });

  it('should pipe the rules', async () => {
    const { vm } = mount(
      defineComponent({
        template: '<div></div>',
        setup() {
          const { r$ } = useRegle({ email: '' }, { email: pipe(required, email) });
          return {
            r$,
          };
        },
      })
    );

    expect(vm.r$.email.$rules.required).toBeDefined();
    expect(vm.r$.email.$rules.email).toBeDefined();

    expect(vm.r$.email.$invalid).toBe(true);

    expect(requiredValidatorMock).toHaveBeenCalled();
    expect(emailValidatorMock).not.toHaveBeenCalled();

    vm.r$.email.$value = 'foo';
    await vm.$nextTick();

    expect(emailValidatorMock).toHaveBeenCalledExactlyOnceWith('foo');
    expect(vm.r$.email.$invalid).toBe(true);
  });

  it('should handle multiple rules', async () => {
    const anonymousValidatorMock = vi.fn((value) => value !== 'foobar');

    const { vm } = mount(
      defineComponent({
        template: '<div></div>',
        setup() {
          const { r$ } = useRegle(
            { name: '' },
            { name: pipe(required, minLengthRule, (value) => anonymousValidatorMock(value), email) }
          );
          return {
            r$,
          };
        },
      })
    );

    expect(vm.r$.name.$rules.required).toBeDefined();
    expect(vm.r$.name.$rules.minLength).toBeDefined();
    expect(vm.r$.name.$rules.anonymous2).toBeDefined();
    expect(vm.r$.name.$rules.email).toBeDefined();

    expect(vm.r$.name.$invalid).toBe(true);

    expect(requiredValidatorMock).toHaveBeenCalledOnce();
    expect(minLengthMock).not.toHaveBeenCalled();
    expect(anonymousValidatorMock).not.toHaveBeenCalled();
    expect(emailValidatorMock).not.toHaveBeenCalled();

    expect(vm.r$.name.$rules.minLength.$valid).toBe(true);

    vm.r$.name.$value = 'fo';
    await vm.$nextTick();

    expect(vm.r$.name.$rules.minLength.$valid).toBe(false);
    expect(requiredValidatorMock).toHaveBeenCalledTimes(2);
    expect(minLengthMock).toHaveBeenCalledExactlyOnceWith('fo', 3);
    // Not called
    expect(anonymousValidatorMock).not.toHaveBeenCalled();
    expect(emailValidatorMock).not.toHaveBeenCalled();

    vm.r$.name.$value = 'foobar';
    await vm.$nextTick();
    expect(requiredValidatorMock).toHaveBeenCalledTimes(3);
    expect(minLengthMock).toHaveBeenCalledTimes(2);
    expect(anonymousValidatorMock).toHaveBeenCalledExactlyOnceWith('foobar');
    // Not called
    expect(emailValidatorMock).not.toHaveBeenCalled();
    expect(vm.r$.name.$invalid).toBe(true);

    vm.r$.name.$value = 'foo@free.fr';
    await vm.$nextTick();
    expect(requiredValidatorMock).toHaveBeenCalledTimes(4);
    expect(minLengthMock).toHaveBeenCalledTimes(3);
    expect(anonymousValidatorMock).toHaveBeenCalledTimes(2);
    expect(emailValidatorMock).toHaveBeenCalledExactlyOnceWith('foo@free.fr');
    expect(vm.r$.name.$invalid).toBe(false);

    vm.r$.name.$value = 'f';
    await vm.$nextTick();
    expect(requiredValidatorMock).toHaveBeenCalledTimes(5);
    expect(minLengthMock).toHaveBeenCalledTimes(4);
    // Not called
    expect(anonymousValidatorMock).toHaveBeenCalledTimes(2);
    expect(emailValidatorMock).toHaveBeenCalledTimes(1);

    expect(vm.r$.name.$invalid).toBe(true);
  });

  it('should handle async inline functions', async () => {
    const asyncValidatorMock = vi.fn(async (value: Maybe<string>) => {
      await timeout(200);
      return value?.includes('@') ?? false;
    });

    const { vm } = mount(
      defineComponent({
        template: '<div></div>',
        setup() {
          const { r$ } = useRegle(
            { email: '' },
            {
              email: pipe(required, minLengthRule, withAsync(asyncValidatorMock), email),
            }
          );
          return { r$ };
        },
      }),
      { attachTo: document.documentElement }
    );

    await nextTick();
    expect(asyncValidatorMock).not.toHaveBeenCalled();

    vm.r$.email.$value = 'te';
    await nextTick();

    expect(asyncValidatorMock).not.toHaveBeenCalled();
    expect(emailValidatorMock).not.toHaveBeenCalled();
    expect(vm.r$.email.$invalid).toBe(true);

    // Set value that passes async
    vm.r$.email.$value = 'test';
    await nextTick();
    await vi.advanceTimersByTimeAsync(200);

    expect(emailValidatorMock).toHaveBeenCalled();
    expect(asyncValidatorMock).toHaveBeenCalled();

    await vi.advanceTimersByTimeAsync(200);
    await nextTick();

    expect(vm.r$.email.$invalid).toBe(true);
    expect(vm.r$.email.$rules.anonymous2.$valid).toBe(false);
    expect(vm.r$.email.$invalid).toBe(true);

    vm.r$.email.$value = 'test@example.com';
    await nextTick();
    await vi.advanceTimersByTimeAsync(200);
    await nextTick();
    await flushPromises();

    expect(asyncValidatorMock).toHaveBeenCalledTimes(2);

    await vi.runAllTimersAsync();
    await nextTick();
    await flushPromises();

    expect(vm.r$.email.$rules.anonymous2.$valid).toBe(true);
    expect(emailValidatorMock).toHaveBeenCalled();
    expect(vm.r$.email.$invalid).toBe(false);
  });

  it('should handle array options and debounce override', async () => {
    const asyncValidatorMock = vi.fn(async (value: Maybe<string>) => {
      await timeout(1000);
      return value?.includes('@') ?? false;
    });

    const { vm } = mount(
      defineComponent({
        template: '<div></div>',
        setup() {
          const { r$ } = useRegle(
            { email: '' },
            { email: pipe([required, email, withAsync(asyncValidatorMock)], { debounce: 500 }) }
          );
          return { r$ };
        },
      })
    );

    vm.r$.email.$value = 'test';
    await vi.runAllTimersAsync();
    await nextTick();

    expect(emailValidatorMock).toHaveBeenCalled();
    expect(asyncValidatorMock).not.toHaveBeenCalled();
    expect(vm.r$.email.$invalid).toBe(true);

    vm.r$.email.$value = 'test@example.com';
    await nextTick();
    await vi.advanceTimersByTimeAsync(600);

    expect(emailValidatorMock).toHaveBeenCalledTimes(2);
    expect(asyncValidatorMock).toHaveBeenCalledTimes(1);
    expect(vm.r$.email.$invalid).toBe(true);
    expect(vm.r$.$pending).toBe(true);

    await vi.advanceTimersByTimeAsync(1000);
    await nextTick();

    expect(vm.r$.email.$invalid).toBe(false);
    expect(vm.r$.$pending).toBe(false);
    expect(vm.r$.email.$rules.anonymous2.$valid).toBe(true);
  });
});
