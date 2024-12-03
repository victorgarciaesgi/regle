import { useRegle } from '@regle/core';
import { email, required } from '@regle/rules';
import { nextTick, ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import {
  shouldBeErrorField,
  shouldBeInvalidField,
  shouldBePristineField,
  shouldBeValidField,
} from '../../../utils/validations.utils';

export function simpleNestedStateInitialState() {
  const form = ref({
    email: 'hello',
    user: {
      firstName: 'foo',
      lastName: 'bar',
    },
    contacts: [{ name: 'contact1' }],
  });

  return useRegle(form, {
    email: { required: required, email },
    user: {
      firstName: { required },
      lastName: { required },
    },
    contacts: {
      $each: {
        name: { required },
      },
    },
  });
}

describe('.$resetAll', () => {
  it('should update the $dirty state to false and reset state to initial state', async () => {
    const { vm } = createRegleComponent(simpleNestedStateInitialState);

    shouldBeInvalidField(vm.r$.$fields.email);
    shouldBePristineField(vm.r$.$fields.user);
    shouldBePristineField(vm.r$.$fields.user.$fields.firstName);
    shouldBePristineField(vm.r$.$fields.user.$fields.lastName);
    shouldBePristineField(vm.r$.$fields.contacts.$each[0].$fields.name);

    vm.r$.$value = {
      email: 'modified',
      user: {
        firstName: 'modified',
        lastName: 'modified',
      },
      contacts: [{ name: 'modified' }, { name: 'modified' }],
    };

    vm.r$.$touch();
    await nextTick();

    shouldBeErrorField(vm.r$.$fields.email);
    shouldBeValidField(vm.r$.$fields.user);
    shouldBeValidField(vm.r$.$fields.user.$fields.firstName);
    shouldBeValidField(vm.r$.$fields.user.$fields.lastName);
    shouldBeValidField(vm.r$.$fields.contacts.$each[0].$fields.name);

    vm.r$.$resetAll();

    await nextTick();

    shouldBeInvalidField(vm.r$.$fields.email);
    shouldBePristineField(vm.r$.$fields.user);
    shouldBePristineField(vm.r$.$fields.user.$fields.firstName);
    shouldBePristineField(vm.r$.$fields.user.$fields.lastName);
    shouldBePristineField(vm.r$.$fields.contacts.$each[0].$fields.name);

    expect(vm.r$.$value).toStrictEqual({
      email: 'hello',
      user: {
        firstName: 'foo',
        lastName: 'bar',
      },
      contacts: [{ name: 'contact1' }],
    });
  });
});
