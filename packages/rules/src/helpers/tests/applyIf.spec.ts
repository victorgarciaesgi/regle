import type { RegleRuleDefinition } from '@regle/core';
import { useRegle } from '@regle/core';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import { timeout } from '../../../../../tests/utils';
import { applyIf } from '../applyIf';
import { required } from '../../rules';

describe('applyIf helper', () => {
  const testComponent = defineComponent({
    setup() {
      const form = ref({
        email: '',
        count: 0,
      });

      return useRegle(form, () => ({
        email: {
          error: applyIf(() => form.value.count === 1, required),
        },
      }));
    },
  });

  const { vm } = mount(testComponent);

  it('should return empty errors', () => {
    expect(vm.r$.$errors.email).toStrictEqual([]);
  });

  it('should be valid when touching field', async () => {
    vm.r$.$fields.email.$touch();
    await timeout(0);
    expect(vm.r$.$errors.email).toStrictEqual([]);
    expect(vm.r$.$error).toBe(false);
  });

  it('should be invalid when touching activating helper', async () => {
    vm.r$.$value.count = 1;
    await timeout(0);
    expect(vm.r$.$errors.email).toStrictEqual(['This field is required']);
    expect(vm.r$.$error).toBe(true);
  });

  it('should have correct types', () => {
    const test = applyIf(
      () => true,
      () => ({ $valid: true, foo: 'bar' })
    );
    expectTypeOf(applyIf(() => true, required)).toEqualTypeOf<
      RegleRuleDefinition<unknown, [condition: boolean], false, boolean, unknown>
    >();

    expectTypeOf(
      applyIf(
        () => true,
        async () => true
      )
    ).toEqualTypeOf<RegleRuleDefinition<unknown, [condition: boolean], true, boolean, unknown>>();

    expectTypeOf(
      applyIf(
        () => true,
        () => ({ $valid: true, foo: 'bar' })
      )
    ).toEqualTypeOf<
      RegleRuleDefinition<
        unknown,
        [condition: boolean],
        false,
        {
          $valid: true;
          foo: string;
        },
        unknown
      >
    >();
  });
});
