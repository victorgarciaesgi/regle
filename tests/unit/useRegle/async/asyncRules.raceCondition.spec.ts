import { flushPromises } from '@vue/test-utils';
import type { Maybe } from '@regle/core';
import { createRule, useRegle } from '@regle/core';
import { isFilled } from '@regle/rules';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { timeout } from '../../../utils';

/**
 * Regression tests for the async validation race condition where a value changed
 * while a previous async validation is still pending could end up being reported
 * with the (stale) result of that previous validation.
 */
describe('useRegle async rules race conditions', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  /**
   * The "valid" value resolves slowly, every other value resolves quickly.
   * This forces the previous (valid) validation to resolve AFTER the new
   * (invalid) one, which is the exact ordering that triggered the bug.
   */
  function raceValidation() {
    const slowWhenValid = createRule({
      async validator(value) {
        if (!isFilled(value)) {
          return true;
        }
        if (value === 'valid') {
          await timeout(2000);
          return true;
        }
        await timeout(200);
        return false;
      },
      message: 'Invalid value',
    });

    return useRegle(ref(''), {
      slowWhenValid,
    });
  }

  it('should not validate a stale value when a slower previous validation resolves last', async () => {
    const { vm } = createRegleComponent(raceValidation);

    // Type the valid (slow) value first.
    vm.r$.$value = 'valid';
    await vm.$nextTick();

    // Async rules debounce by 200ms, then the slow validator (2000ms) starts.
    await vi.advanceTimersByTimeAsync(200);
    await flushPromises();
    expect(vm.r$.$pending).toBe(true);

    // Before it resolves, type an invalid (fast) value.
    vm.r$.$value = 'invalid';
    await vm.$nextTick();

    // Debounce + fast validator resolves while the previous one is still pending.
    await vi.advanceTimersByTimeAsync(200);
    await flushPromises();
    await vi.advanceTimersByTimeAsync(200);
    await flushPromises();

    // The invalid value must already be reported as invalid.
    expect(vm.r$.$value).toBe('invalid');
    expect(vm.r$.$invalid).toBe(true);
    expect(vm.r$.$error).toBe(true);

    // Now let the stale "valid" validation finally resolve.
    await vi.advanceTimersByTimeAsync(2000);
    await flushPromises();

    // The stale "valid" result must NOT overwrite the invalid one.
    expect(vm.r$.$value).toBe('invalid');
    expect(vm.r$.$invalid).toBe(true);
    expect(vm.r$.$error).toBe(true);
  });

  /**
   * The reverse ordering: the previous (invalid) validation is slow and resolves
   * AFTER the new (valid) one. The stale invalid result must not flip a valid value
   * back to invalid.
   */
  function reverseRaceValidation() {
    const slowWhenInvalid = createRule({
      async validator(value: Maybe<string>) {
        if (!isFilled(value)) {
          return true;
        }
        if (value === 'valid') {
          await timeout(200);
          return true;
        }
        await timeout(2000);
        return false;
      },
      message: 'Invalid value',
    });

    return useRegle(ref(''), {
      slowWhenInvalid,
    });
  }

  it('should not invalidate a fresh valid value when a slower previous (invalid) validation resolves last', async () => {
    const { vm } = createRegleComponent(reverseRaceValidation);

    // Type the invalid (slow) value first.
    vm.r$.$value = 'invalid';
    await vm.$nextTick();

    await vi.advanceTimersByTimeAsync(200);
    await flushPromises();
    expect(vm.r$.$pending).toBe(true);

    // Before it resolves, type a valid (fast) value.
    vm.r$.$value = 'valid';
    await vm.$nextTick();

    // Debounce + fast validator resolves while the previous one is still pending.
    await vi.advanceTimersByTimeAsync(200);
    await flushPromises();
    await vi.advanceTimersByTimeAsync(200);
    await flushPromises();

    expect(vm.r$.$value).toBe('valid');
    expect(vm.r$.$invalid).toBe(false);
    expect(vm.r$.$error).toBe(false);

    // Now let the stale "invalid" validation finally resolve.
    await vi.advanceTimersByTimeAsync(2000);
    await flushPromises();

    // The stale "invalid" result must NOT overwrite the valid one.
    expect(vm.r$.$value).toBe('valid');
    expect(vm.r$.$invalid).toBe(false);
    expect(vm.r$.$error).toBe(false);
    expect(vm.r$.$pending).toBe(false);
  });

  /**
   * A field carrying both a sync rule and an async rule: a stale async result must
   * not corrupt the field-level aggregation, and the shared pending flag must clear.
   */
  function multiRuleRaceValidation() {
    const longEnough = createRule({
      validator(value: Maybe<string>) {
        if (!isFilled(value)) {
          return true;
        }
        return value.length >= 3;
      },
      message: 'Too short',
    });

    const slowWhenValid = createRule({
      async validator(value: Maybe<string>) {
        if (!isFilled(value)) {
          return true;
        }
        if (value === 'valid') {
          await timeout(2000);
          return true;
        }
        await timeout(200);
        return false;
      },
      message: 'Invalid value',
    });

    return useRegle(ref(''), {
      longEnough,
      slowWhenValid,
    });
  }

  it('should keep field aggregation correct with mixed sync + async rules when a stale async result resolves last', async () => {
    const { vm } = createRegleComponent(multiRuleRaceValidation);

    // Both the sync rule (length >= 3) and the async rule pass for 'valid'.
    vm.r$.$value = 'valid';
    await vm.$nextTick();

    await vi.advanceTimersByTimeAsync(200);
    await flushPromises();
    expect(vm.r$.$pending).toBe(true);

    // Switch to an invalid (fast) async value that still satisfies the sync rule.
    vm.r$.$value = 'invalid';
    await vm.$nextTick();

    await vi.advanceTimersByTimeAsync(200);
    await flushPromises();
    await vi.advanceTimersByTimeAsync(200);
    await flushPromises();

    expect(vm.r$.$invalid).toBe(true);
    expect(vm.r$.$error).toBe(true);
    expect(vm.r$.$rules.longEnough.$valid).toBe(true);
    expect(vm.r$.$rules.slowWhenValid.$valid).toBe(false);

    // The stale "valid" async run resolves last and must not flip the field to valid.
    await vi.advanceTimersByTimeAsync(2000);
    await flushPromises();

    expect(vm.r$.$invalid).toBe(true);
    expect(vm.r$.$error).toBe(true);
    expect(vm.r$.$pending).toBe(false);
    expect(vm.r$.$rules.slowWhenValid.$valid).toBe(false);
  });

  /**
   * Same race, but the validator returns a metadata object. The stale run must not
   * leave its metadata behind paired with the latest run's validity.
   */
  function metadataRaceValidation() {
    const slowWhenValid = createRule({
      async validator(value: Maybe<string>) {
        if (!isFilled(value)) {
          return { $valid: true, label: value } as const;
        }
        await timeout(value === 'valid' ? 2000 : 200);
        return { $valid: value === 'valid', label: value };
      },
      message: 'Invalid value',
    });

    return useRegle(ref(''), {
      slowWhenValid,
    });
  }

  it('should not keep stale metadata when a slower previous validation resolves last', async () => {
    const { vm } = createRegleComponent(metadataRaceValidation);

    vm.r$.$value = 'valid';
    await vm.$nextTick();

    await vi.advanceTimersByTimeAsync(200);
    await flushPromises();
    expect(vm.r$.$pending).toBe(true);

    vm.r$.$value = 'invalid';
    await vm.$nextTick();

    await vi.advanceTimersByTimeAsync(200);
    await flushPromises();
    await vi.advanceTimersByTimeAsync(200);
    await flushPromises();

    expect(vm.r$.$rules.slowWhenValid.$valid).toBe(false);
    expect(vm.r$.$rules.slowWhenValid.$metadata.label).toBe('invalid');

    // The stale "valid" run resolves last: neither its validity nor its metadata
    // may overwrite the latest "invalid" result.
    await vi.advanceTimersByTimeAsync(2000);
    await flushPromises();

    expect(vm.r$.$rules.slowWhenValid.$valid).toBe(false);
    expect(vm.r$.$rules.slowWhenValid.$metadata.label).toBe('invalid');
  });
});
