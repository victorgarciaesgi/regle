import { useRegle } from '@regle/core';
import { email, required, requiredIf } from '@regle/rules';
import { nextTick, ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import {
  shouldBeErrorField,
  shouldBeInvalidField,
  shouldBePristineField,
  shouldBeUnRuledCorrectField,
  shouldBeValidField,
} from '../../../utils/validations.utils';

export function simpleNestedStateInitialState() {
  const condition = ref(false);
  const form = ref({
    email: 'hello',
    user: {
      firstName: 'foo',
      lastName: 'bar',
    },
    contacts: [{ name: 'contact1' }],
    nestedArrays: [] as Array<{ otherArray: { name: string }[] }>,
  });

  return {
    condition,
    ...useRegle(form, {
      email: { required: requiredIf(condition), email },
      user: {
        firstName: { required },
        lastName: { required },
      },
      contacts: {
        $each: {
          name: { required },
        },
      },
    }),
  };
}

describe('r$.$reset to initial state', () => {
  it('should update the $dirty state to false and reset state to initial state', async () => {
    const { vm } = createRegleComponent(simpleNestedStateInitialState);

    shouldBeInvalidField(vm.r$.email);
    shouldBePristineField(vm.r$.user);
    shouldBePristineField(vm.r$.user.firstName);
    shouldBePristineField(vm.r$.user.lastName);
    shouldBePristineField(vm.r$.contacts.$each[0].name);

    await nextTick();

    vm.r$.$value = {
      email: 'modified',
      user: {
        firstName: 'modified',
        lastName: 'modified',
      },
      contacts: [{ name: 'modified' }, { name: 'modified' }],
      nestedArrays: [{ otherArray: [] }],
    };

    await nextTick();

    vm.r$.$value.nestedArrays[0].otherArray.push({ name: '' });

    await nextTick();

    shouldBeErrorField(vm.r$.email);
    shouldBeValidField(vm.r$.user);
    shouldBeValidField(vm.r$.user.firstName);
    shouldBeValidField(vm.r$.user.lastName);
    shouldBeValidField(vm.r$.contacts.$each[0].name);

    vm.r$.$value.email = '';
    await nextTick();
    shouldBeUnRuledCorrectField(vm.r$.email);

    vm.condition = true;
    await nextTick();
    shouldBeErrorField(vm.r$.email);

    vm.r$.$reset({ toInitialState: true });

    await nextTick();

    shouldBeInvalidField(vm.r$.email);
    shouldBePristineField(vm.r$.user);
    shouldBePristineField(vm.r$.user.firstName);
    shouldBePristineField(vm.r$.user.lastName);
    shouldBePristineField(vm.r$.contacts.$each[0].name);

    expect(vm.r$.$value).toStrictEqual({
      email: 'hello',
      user: {
        firstName: 'foo',
        lastName: 'bar',
      },
      contacts: [{ name: 'contact1' }],
      nestedArrays: [],
    });

    vm.r$.$reset({ toInitialState: true });

    await nextTick();

    shouldBeInvalidField(vm.r$.email);
    shouldBePristineField(vm.r$.user);
    shouldBePristineField(vm.r$.user.firstName);
    shouldBePristineField(vm.r$.user.lastName);
    shouldBePristineField(vm.r$.contacts.$each[0].name);

    expect(vm.r$.$value).toStrictEqual({
      email: 'hello',
      user: {
        firstName: 'foo',
        lastName: 'bar',
      },
      contacts: [{ name: 'contact1' }],
      nestedArrays: [],
    });
  });
});
