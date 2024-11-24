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

      const { errors, validateState, regle } = useRegle(form, () => ({
        email: {
          error: applyIf(() => form.value.count === 1, required),
        },
      }));

      return { form, errors, validateState, regle };
    },
  });

  const { vm } = mount(testComponent);

  it('should return empty errors', () => {
    expect(vm.errors.email).toStrictEqual([]);
  });

  it('should be valid when touching field', async () => {
    vm.regle.$fields.email.$touch();
    await timeout(0);
    expect(vm.errors.email).toStrictEqual([]);
    expect(vm.regle.$error).toBe(false);
  });

  it('should be invalid when touching activating helper', async () => {
    vm.form.count = 1;
    await timeout(0);
    expect(vm.errors.email).toStrictEqual(['This field is required']);
    expect(vm.regle.$error).toBe(true);
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
