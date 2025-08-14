import type { AllRulesDeclarations, RegleRuleDecl } from '@regle/core';
import { useRegle } from '@regle/core';
import { mount } from '@vue/test-utils';
import { computed, defineComponent, nextTick, ref, type ComputedRef } from 'vue';
import { email, minLength, required } from '../../rules';
import { assignIf } from '../assignIf';
import { createRegleComponent } from '../../../../../tests/utils/test.utils';

describe('assignIf helper', () => {
  const testComponent = defineComponent({
    setup() {
      const form = ref({
        name: '',
        email: '',
        isAdvanced: false,
      });

      return useRegle(form, () => ({
        name: assignIf(() => form.value.isAdvanced, {
          required,
          minLength: minLength(3),
        }),
        email: assignIf(() => form.value.isAdvanced, {
          required,
          email,
        }),
      }));
    },
    template: '<div></div>',
  });

  const { vm } = mount(testComponent);

  it('should return empty errors when condition is false', async () => {
    expect(vm.r$.$errors.name).toStrictEqual([]);
    expect(vm.r$.$errors.email).toStrictEqual([]);

    vm.r$.name.$touch();
    vm.r$.email.$touch();

    await nextTick();

    expect(vm.r$.$errors.name).toStrictEqual([]);
    expect(vm.r$.$errors.email).toStrictEqual([]);
    expect(vm.r$.$error).toBe(false);
  });

  it('should apply rules when condition becomes true', async () => {
    vm.r$.$value.isAdvanced = true;
    await nextTick();

    // Should now have validation errors since fields are empty and rules are applied
    expect(vm.r$.$errors.name).toStrictEqual(['This field is required']);
    expect(vm.r$.$errors.email).toStrictEqual(['This field is required']);
    expect(vm.r$.$error).toBe(true);
  });

  it('should validate correctly when condition is true and values are provided', async () => {
    vm.r$.$value.isAdvanced = true;
    vm.r$.$value.name = 'John';
    vm.r$.$value.email = 'john@example.com';
    await nextTick();

    expect(vm.r$.$errors.name).toStrictEqual([]);
    expect(vm.r$.$errors.email).toStrictEqual([]);
    expect(vm.r$.$error).toBe(false);
  });

  it('should show specific rule errors when condition is true', async () => {
    vm.r$.$value.isAdvanced = true;
    vm.r$.$value.name = 'Jo';
    vm.r$.$value.email = 'invalid-email';
    await nextTick();

    vm.r$.$touch();

    expect(vm.r$.$errors.name).toStrictEqual(['The value length should be at least 3']);
    expect(vm.r$.$errors.email).toStrictEqual(['The value must be an valid email address']);
    expect(vm.r$.$error).toBe(true);
  });

  it('should remove rules when condition becomes false again', async () => {
    vm.r$.$value.isAdvanced = true;
    await nextTick();
    expect(vm.r$.$error).toBe(true);

    vm.r$.$value.isAdvanced = false;
    await nextTick();
    expect(vm.r$.$error).toBe(false);
    expect(vm.r$.$errors.name).toStrictEqual([]);
    expect(vm.r$.$errors.email).toStrictEqual([]);
  });

  it('should work with reactive condition', async () => {
    const { vm } = createRegleComponent(() => {
      const form = ref({
        name: '',
        count: 0,
      });

      const isActive = computed(() => form.value.count > 5);

      return useRegle(form, () => ({
        name: assignIf(isActive, {
          required,
          minLength: minLength(3),
        }),
      }));
    });

    vm.r$.$touch();

    expect(vm.r$.$errors.name).toStrictEqual([]);

    vm.r$.count.$value = 6;
    await vm.$nextTick();

    expect(vm.r$.$errors.name).toStrictEqual(['This field is required']);

    vm.r$.count.$value = 3;
    await vm.$nextTick();

    expect(vm.r$.$errors.name).toStrictEqual([]);
  });

  it('should work with ref condition', async () => {
    const { vm } = createRegleComponent(() => {
      const form = ref({
        name: '',
      });

      const condition = ref(false);

      return {
        ...useRegle(form, () => ({
          name: assignIf(condition, {
            required,
          }),
        })),
        condition,
      };
    });

    vm.r$.$touch();

    expect(vm.r$.$errors.name).toStrictEqual([]);

    vm.condition = true;
    await vm.$nextTick();

    expect(vm.r$.$errors.name).toStrictEqual(['This field is required']);

    vm.condition = false;
    await vm.$nextTick();

    expect(vm.r$.$errors.name).toStrictEqual([]);
  });

  it('should work with nested rules structure', async () => {
    const { vm } = createRegleComponent(() => {
      const form = ref({
        user: {
          profile: {
            name: '',
            bio: '',
          },
        },
        enableValidation: false,
      });

      return useRegle(form, () => ({
        user: {
          profile: {
            name: assignIf(() => form.value.enableValidation, {
              required,
              minLength: minLength(2),
            }),
            bio: assignIf(() => form.value.enableValidation, {
              minLength: minLength(10),
            }),
          },
        },
      }));
    });

    vm.r$.$touch();
    vm.r$.user.profile.bio.$value = 'short';

    expect(vm.r$.$errors.user.profile.name).toStrictEqual([]);
    expect(vm.r$.$errors.user.profile.bio).toStrictEqual([]);

    vm.r$.enableValidation.$value = true;
    await vm.$nextTick();

    expect(vm.r$.$errors.user.profile.name).toStrictEqual(['This field is required']);
    expect(vm.r$.$errors.user.profile.bio).toStrictEqual(['The value length should be at least 10']);
  });

  it('should have correct return type', () => {
    const condition = ref(true);
    const rules = { required, minLength: minLength(3) };

    const result = assignIf(condition, rules);

    expectTypeOf(result).toEqualTypeOf<ComputedRef<RegleRuleDecl<any, Partial<AllRulesDeclarations>>>>();
  });

  it('should work with falsy conditions', async () => {
    const { vm } = createRegleComponent(() => {
      const form = ref({
        name: '',
        condition: null as boolean | null,
      });

      return useRegle(form, () => ({
        name: assignIf(() => form.value.condition, {
          required,
        }),
      }));
    });

    vm.r$.$touch();

    expect(vm.r$.$errors.name).toStrictEqual([]);

    vm.r$.condition.$value = null;
    await vm.$nextTick();
    expect(vm.r$.$errors.name).toStrictEqual([]);

    vm.r$.condition.$value = false;
    await vm.$nextTick();
    expect(vm.r$.$errors.name).toStrictEqual([]);

    vm.r$.condition.$value = true;
    await vm.$nextTick();
    expect(vm.r$.$errors.name).toStrictEqual(['This field is required']);
  });
});
