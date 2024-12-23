import { simpleNestedStateWithMixedValidation } from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeInvalidField, shouldBePristineField } from '../../../utils/validations.utils';

it('should update the source value', async () => {
  const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

  vm.r$.$silentValue = {
    user: {
      firstName: 'foo',
      lastName: 'foo',
    },
    email: 'foo',
    contacts: [{ name: 'foo' }],
  };
  await vm.$nextTick();

  shouldBeInvalidField(vm.r$);
  shouldBeInvalidField(vm.r$.$fields.email);
  shouldBePristineField(vm.r$.$fields.user.$fields.firstName);
  shouldBePristineField(vm.r$.$fields.user.$fields.lastName);
  shouldBePristineField(vm.r$.$fields.contacts.$each[0].$fields.name);
});
