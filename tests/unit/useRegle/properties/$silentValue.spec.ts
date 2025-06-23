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
  shouldBeInvalidField(vm.r$.email);
  shouldBePristineField(vm.r$.user.firstName);
  shouldBePristineField(vm.r$.user.lastName);
  shouldBePristineField(vm.r$.contacts.$each[0].name);
});
