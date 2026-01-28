import { flatErrors, useRegle } from '@regle/core';
import { email, minLength, required } from '@regle/rules';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import type { StandardSchemaV1 } from '@standard-schema/spec';

function errorsRules() {
  const form = ref({
    email: '',
    user: {
      firstName: '',
      nested: {
        child: '',
        collection: [{ name: '' }],
      },
    },
    contacts: [{ name: '' }],
  });

  return useRegle(form, {
    email: { required, email, minLength: minLength(5) },
    user: {
      firstName: { required },
      nested: {
        child: { required },
        collection: {
          required,
          $each: {
            name: { required },
          },
        },
      },
    },
    contacts: {
      $each: {
        name: { required },
      },
    },
  });
}

describe('flatErrors', () => {
  it('should flat nested errors when called on `$errors`', async () => {
    const { vm } = createRegleComponent(errorsRules);

    const flats = flatErrors(vm.r$.$errors);
    expectTypeOf(flats).toEqualTypeOf<string[]>();

    expect(flats).toStrictEqual([]);

    await vm.r$.$validate();

    const flats2 = flatErrors(vm.r$.$errors);

    expect(flats2.length).toBe(5);

    expect(flats2).toStrictEqual([
      'This field is required',
      'This field is required',
      'This field is required',
      'This field is required',
      'This field is required',
    ]);
  });

  it('should flat nested errors when called on `$errors`, and include paths when called with parameter', async () => {
    const { vm } = createRegleComponent(errorsRules);

    const flats = flatErrors(vm.r$.$errors, { includePath: true });
    expectTypeOf(flats).toEqualTypeOf<StandardSchemaV1.Issue[]>();

    expect(flats).toStrictEqual([]);

    await vm.r$.$validate();

    const flats2 = flatErrors(vm.r$.$errors, { includePath: true });

    expect(flats2.length).toBe(5);

    expect(flats2).toStrictEqual([
      { message: 'This field is required', path: ['email'] },
      { message: 'This field is required', path: ['user', 'firstName'] },
      { message: 'This field is required', path: ['user', 'nested', 'child'] },
      { message: 'This field is required', path: ['user', 'nested', 'collection', 0, 'name'] },
      { message: 'This field is required', path: ['contacts', 0, 'name'] },
    ]);

    vm.r$.$value.email = 'foo';
    await vm.$nextTick();

    const flats3 = flatErrors(vm.r$.$errors, { includePath: true });

    expect(flats3).toStrictEqual([
      { message: 'The value must be a valid email address', path: ['email'] },
      { message: 'The value must be at least 5 characters long', path: ['email'] },
      { message: 'This field is required', path: ['user', 'firstName'] },
      { message: 'This field is required', path: ['user', 'nested', 'child'] },
      { message: 'This field is required', path: ['user', 'nested', 'collection', 0, 'name'] },
      { message: 'This field is required', path: ['contacts', 0, 'name'] },
    ]);
  });
});
