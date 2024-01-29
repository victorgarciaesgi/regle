import { useRegle } from '@regle/core';
import {
  and,
  email,
  maxLength,
  minLength,
  required,
  ruleHelpers,
  sameAs,
  withAsync,
  withMessage,
} from '@regle/validators';
import { defineComponent, ref } from 'vue';
import { mount } from '@vue/test-utils';

describe('useRegle composable with classic form', () => {
  const testComponent = defineComponent({
    setup() {
      const form = ref({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        confirmPassword: '',
      });

      const { $errors, validateForm, $regle, $invalid, $valid, resetForm } = useRegle(form, () => ({
        email: {
          email,
          required,
        },
        firstName: {
          minLength: minLength(6),
        },
        lastName: {
          minLength: minLength(6),
          maxLength: maxLength(10),
        },
        password: {
          required,
        },
        confirmPassword: {
          required,
          sameAs: sameAs(() => form.value.password),
        },
      }));

      return { form, $errors, validateForm, $regle, $invalid, $valid, resetForm };
    },
  });

  const { vm } = mount(testComponent);

  it('should have a initial state', () => {
    expect(vm.$errors).toStrictEqual({
      email: [],
      firstName: [],
      lastName: [],
      password: [],
      confirmPassword: [],
    });

    expect(vm.$invalid).toBe(false);
    expect(vm.$valid).toBe(false);

    expect(vm.$regle.$anyDirty).toBe(false);
    expect(vm.$regle.$dirty).toBe(false);
    expect(vm.$regle.$error).toBe(false);
    expect(vm.$regle.$pending).toBe(false);
    expect(vm.$regle.$value).toStrictEqual({
      email: '',
      firstName: '',
      lastName: '',
      password: '',
      confirmPassword: '',
    });

    expect(vm.$regle.$fields.email.$valid).toBe(true);
    expect(vm.$regle.$fields.firstName.$valid).toBe(true);
    expect(vm.$regle.$fields.lastName.$valid).toBe(true);
    expect(vm.$regle.$fields.password.$valid).toBe(true);
    expect(vm.$regle.$fields.password.$valid).toBe(true);
  });

  it('should error on initial submit', async () => {
    const result = await vm.validateForm();

    expect(result).toBe(false);
    expect(vm.$errors).toStrictEqual({
      email: ['Value is required'],
      firstName: [],
      lastName: [],
      password: ['Value is required'],
      confirmPassword: ['Value is required'],
    });

    expect(vm.$invalid).toBe(true);
    expect(vm.$valid).toBe(false);

    expect(vm.$regle.$anyDirty).toBe(true);
    expect(vm.$regle.$dirty).toBe(true);
    expect(vm.$regle.$error).toBe(true);
    expect(vm.$regle.$pending).toBe(false);

    expect(vm.$regle.$fields.email.$valid).toBe(false);
    expect(vm.$regle.$fields.firstName.$valid).toBe(true);
    expect(vm.$regle.$fields.lastName.$valid).toBe(true);
    expect(vm.$regle.$fields.password.$valid).toBe(false);
    expect(vm.$regle.$fields.password.$valid).toBe(false);
  });
});
