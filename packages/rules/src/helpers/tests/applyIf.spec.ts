import type { RegleRuleDefinition } from '@regle/core';
import { RegleVuePlugin, useRegle } from '@regle/core';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import { alpha, minLength, required } from '../../rules';
import { applyIf } from '../applyIf';
import { createRegleComponent } from '../../../../../tests/utils/test.utils';

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
          foo: applyIf(false, alpha),
          $autoDirty: false,
        },
      }));
    },
    template: '<div></div>',
  });

  const { vm } = mount(testComponent, {
    global: {
      plugins: [RegleVuePlugin],
    },
  });

  it('should return empty errors', () => {
    expect(vm.r$.$errors.email).toStrictEqual([]);
  });

  it('should be valid when touching field', async () => {
    vm.r$.email.$touch();
    await nextTick();
    expect(vm.r$.$errors.email).toStrictEqual([]);
    expect(vm.r$.$error).toBe(false);
  });

  it('should be invalid when touching activating helper', async () => {
    vm.r$.$value.count = 1;
    await nextTick();
    expect(vm.r$.$errors.email).toStrictEqual(['This field is required']);
    expect(vm.r$.$error).toBe(true);
  });

  it('should not add too much params other validators using it', async () => {
    const { vm } = createRegleComponent(() => {
      const form = ref({
        email: '',
        name: '',
        count: 0,
        field: '',
      });

      return useRegle(form, () => ({
        email: {
          error: applyIf(form.value.count === 1, required),
        },
        name: {
          error: applyIf(form.value.count === 1, (value) => required.exec(value)),
        },
        field: {
          error: applyIf(form.value.count === 1, minLength(3)),
        },
      }));
    });

    expect(vm.r$.email.$rules.error.$params).toStrictEqual([false]);
    expect(vm.r$.name.$rules.error.$params).toStrictEqual([false]);
    expect(vm.r$.field.$rules.error.$params).toStrictEqual([3, false]);

    vm.r$.count.$value = 1;

    await vm.$nextTick();

    expect(vm.r$.email.$rules.error.$params).toStrictEqual([true]);
    expect(vm.r$.name.$rules.error.$params).toStrictEqual([true]);
    expect(vm.r$.field.$rules.error.$params).toStrictEqual([3, true]);
  });

  it('should have correct types', () => {
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
