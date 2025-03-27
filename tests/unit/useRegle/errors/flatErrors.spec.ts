import { flatErrors, useRegle } from '@regle/core';
import { required } from '@regle/rules';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';

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
    email: { required },
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
    expectTypeOf(flats).toEqualTypeOf<{ error: string; path: string }[]>();

    expect(flats).toStrictEqual([]);

    await vm.r$.$validate();

    const flats2 = flatErrors(vm.r$.$errors, { includePath: true });

    expect(flats2.length).toBe(5);

    expect(flats2).toStrictEqual([
      { error: 'This field is required', path: 'email' },
      { error: 'This field is required', path: 'user.firstName' },
      { error: 'This field is required', path: 'user.nested.child' },
      { error: 'This field is required', path: 'user.nested.collection.0.name' },
      { error: 'This field is required', path: 'contacts.0.name' },
    ]);
  });
});
