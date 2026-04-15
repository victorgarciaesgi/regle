import { createRule, useRegle, type Maybe } from '@regle/core';
import { required } from '@regle/rules';
import { flushPromises } from '@vue/test-utils';
import { nextTick, ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';

/**
 * Mirrors playground/vue3/src/components/Test12.vue: async username rule with a 2s delay.
 *
 * When `createReactiveFieldStatus.$validateWithoutRaceconditions` early-returns (see
 * createReactiveFieldStatus.ts ~784–800), it skips `rule.$parse()` on submit if the field already
 * ran validation under autoDirty with matching flags ($autoDirty, !$silent, $dirty, !$validating,
 */
function createTest12LikeRegle(options?: { autoDirty?: boolean }) {
  const asyncValidatorSpy = vi.fn(async (value: Maybe<string>) => {
    if (!value?.trim()) {
      return true;
    }
    await vi.advanceTimersByTimeAsync(2000);
    return !value.toLowerCase().includes('taken');
  });

  const checkUsernameAvailable = createRule({
    async validator(value: Maybe<string>) {
      return asyncValidatorSpy(value);
    },
    message: 'This username is already taken',
  });

  return () => {
    const form = ref({ username: '' });
    const regle = useRegle(form, { username: { required, checkUsernameAvailable } }, options);
    return { ...regle, asyncValidatorSpy };
  };
}

async function flushAsyncValidationAfterEdit() {
  await vi.advanceTimersByTimeAsync(200);
  await nextTick();
  await vi.advanceTimersByTimeAsync(2000);
  await flushPromises();
}

describe('$validate cached field result (Test12 async + submit)', () => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  it('does not re-run async rules on repeated r$.$validate after auto-validation has finished (default autoDirty)', async () => {
    const { vm } = await createRegleComponent(createTest12LikeRegle());

    vm.r$.$value.username = 'okuser';
    await flushAsyncValidationAfterEdit();

    const callsAfterAutoValidation = vm.asyncValidatorSpy.mock.calls.length;
    expect(callsAfterAutoValidation).toBeGreaterThan(0);
    expect(vm.r$.username.$pending).toBe(false);
    expect(vm.r$.username.$dirty).toBe(true);

    const first = await vm.r$.$validate();
    await flushPromises();

    expect(vm.asyncValidatorSpy.mock.calls.length).toBe(callsAfterAutoValidation);
    expect(first.valid).toBe(true);

    const second = await vm.r$.$validate();
    await flushPromises();

    expect(vm.asyncValidatorSpy.mock.calls.length).toBe(callsAfterAutoValidation);
    expect(second.valid).toBe(true);
  });

  it('does not re-run async rules when the last result was invalid (taken)', async () => {
    const { vm } = await createRegleComponent(createTest12LikeRegle());

    vm.r$.$value.username = 'taken-user';
    await flushAsyncValidationAfterEdit();

    const callsAfterAutoValidation = vm.asyncValidatorSpy.mock.calls.length;
    expect(callsAfterAutoValidation).toBeGreaterThan(0);
    expect(vm.r$.username.$invalid).toBe(true);

    await vm.r$.$validate();
    await flushPromises();

    expect(vm.asyncValidatorSpy.mock.calls.length).toBe(callsAfterAutoValidation);

    await vm.r$.$validate();
    await flushPromises();

    expect(vm.asyncValidatorSpy.mock.calls.length).toBe(callsAfterAutoValidation);
  });

  it('runs async rules again on each r$.$validate when autoDirty is false (shortcut disabled)', async () => {
    const { vm } = await createRegleComponent(createTest12LikeRegle({ autoDirty: false }));

    vm.r$.$value.username = 'okuser';
    await flushAsyncValidationAfterEdit();

    const callsAfterAutoValidation = vm.asyncValidatorSpy.mock.calls.length;
    expect(callsAfterAutoValidation).toBeGreaterThan(0);

    await vm.r$.$validate();
    await flushPromises();

    expect(vm.asyncValidatorSpy.mock.calls.length).toBeGreaterThan(callsAfterAutoValidation);

    const afterFirstValidate = vm.asyncValidatorSpy.mock.calls.length;

    await vm.r$.$validate();
    await flushPromises();

    expect(vm.asyncValidatorSpy.mock.calls.length).toBeGreaterThan(afterFirstValidate);
  });
});
