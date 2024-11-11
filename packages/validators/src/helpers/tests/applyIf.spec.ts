import { RegleRuleDefinition, useRegle } from '@regle/core';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import { timeout } from '../../../../../tests/utils';
import { applyIf } from '../../helpers/applyIf';
import { required } from '../../validators';

describe('applyIf helper', () => {
  const testComponent = defineComponent({
    setup() {
      const form = ref({
        email: '',
        count: 0,
      });

      const { errors, validateForm, regle } = useRegle(form, () => ({
        email: {
          error: applyIf(() => form.value.count === 1, required),
        },
      }));

      return { form, errors, validateForm, regle };
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
      RegleRuleDefinition<unknown, [], false, boolean, unknown>
    >();

    expectTypeOf(
      applyIf(
        () => true,
        async () => true
      )
    ).toEqualTypeOf<RegleRuleDefinition<unknown, [], true, boolean, unknown>>();

    expectTypeOf(
      applyIf(
        () => true,
        () => ({ $valid: true, foo: 'bar' })
      )
    ).toEqualTypeOf<
      RegleRuleDefinition<
        unknown,
        [],
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
