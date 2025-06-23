import { useRegle } from '@regle/core';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField } from '../../../utils/validations.utils';
import { ref } from 'vue';
import { email, required } from '@regle/rules';

function nestedStateValidations() {
  const form = ref({
    email: '',
    user: {
      firstName: '',
      lastName: '',
    },
    contacts: [{ level: undefined }] as { level?: { name: string } }[],
  });

  return useRegle(form, {
    email: { required: required, email: email },
    user: {
      firstName: { required },
      lastName: { required },
    },
    contacts: {
      $each: {
        level: {
          name: { required },
        },
      },
    },
  });
}

it('should update the source value', async () => {
  const { vm } = await createRegleComponent(nestedStateValidations);

  vm.r$.$value.email = 'Hello';
  await vm.$nextTick();
  expect(vm.r$.$value.email).toBe('Hello');
  shouldBeErrorField(vm.r$.email);

  // Setting undefined to nested object should update children invalid status and $value
  vm.r$.$value.user = undefined as any;
  await vm.$nextTick();
  expect(vm.r$.user.firstName.$invalid).toBe(true);

  vm.r$.$value.user = { firstName: 'John', lastName: 'Doe' };
  await vm.$nextTick();
  expect(vm.r$.user.firstName.$value).toBe('John');
  expect(vm.r$.user.lastName.$value).toBe('Doe');

  // Setting undefined to nested object should update collection children invalid status and $value

  expect(vm.r$.contacts.$each[0].level?.name.$invalid).toBe(true);

  vm.r$.$value.contacts[0].level = { name: 'Hello' };
  await vm.$nextTick();
  expect(vm.r$.contacts.$each[0].level?.name.$value).toBe('Hello');
  expect(vm.r$.contacts.$each[0].level?.name.$invalid).toBe(false);

  if (vm.r$.contacts.$each[0].level) {
    vm.r$.contacts.$each[0].level.name.$value = 'Coucou';
  }

  await vm.$nextTick();

  expect(vm.r$.$value.contacts[0].level).toStrictEqual({ name: 'Coucou' });
});
