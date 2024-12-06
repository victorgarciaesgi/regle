import { useRegle } from '@regle/core';
import { email, required } from '@regle/rules';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';

export function nestedRefObjectValidation() {
  const form = ref({
    email: '',
    name: '',
  });

  return useRegle(
    form,
    {
      email: { required, email },
      name: { required },
    },
    {
      validationGroups: (fields) => ({
        nameAndEmail: [fields.email, fields.name],
      }),
    }
  );
}
describe('validation groups', () => {
  it('should correctly', async () => {
    const { vm } = createRegleComponent(nestedRefObjectValidation);

    await vm.$nextTick();

    expect(vm.r$.$groups.nameAndEmail.$dirty).toBe(false);
    expect(vm.r$.$groups.nameAndEmail.$error).toBe(false);
    expect(vm.r$.$groups.nameAndEmail.$errors).toStrictEqual([]);
    expect(vm.r$.$groups.nameAndEmail.$invalid).toBe(true);
    expect(vm.r$.$groups.nameAndEmail.$pending).toBe(false);
    expect(vm.r$.$groups.nameAndEmail.$silentErrors).toStrictEqual([
      'This field is required',
      'Value must be an valid email address',
      'This field is required',
    ]);
    expect(vm.r$.$groups.nameAndEmail.$valid).toStrictEqual(false);

    vm.r$.$touch();
    await vm.$nextTick();

    expect(vm.r$.$groups.nameAndEmail.$dirty).toBe(true);
    expect(vm.r$.$groups.nameAndEmail.$error).toBe(true);
    expect(vm.r$.$groups.nameAndEmail.$invalid).toBe(true);
    expect(vm.r$.$groups.nameAndEmail.$pending).toBe(false);
    expect(vm.r$.$groups.nameAndEmail.$errors).toStrictEqual([
      'This field is required',
      'This field is required',
    ]);
    expect(vm.r$.$groups.nameAndEmail.$valid).toStrictEqual(false);

    vm.r$.$value.email = 'foo@free.fr';
    vm.r$.$value.name = 'bar';
    await vm.$nextTick();

    expect(vm.r$.$groups.nameAndEmail.$dirty).toBe(true);
    expect(vm.r$.$groups.nameAndEmail.$error).toBe(false);
    expect(vm.r$.$groups.nameAndEmail.$invalid).toBe(false);
    expect(vm.r$.$groups.nameAndEmail.$pending).toBe(false);
    expect(vm.r$.$groups.nameAndEmail.$errors).toStrictEqual([]);
    expect(vm.r$.$groups.nameAndEmail.$valid).toStrictEqual(true);
  });
});
