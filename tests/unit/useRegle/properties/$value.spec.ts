import { simpleNestedStateWithMixedValidation } from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField } from '../../../utils/validations.utils';

it('should update the source value', async () => {
  const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

  vm.r$.$value.email = 'Hello';
  await vm.$nextTick();
  expect(vm.state.email).toBe('Hello');
  shouldBeErrorField(vm.r$.$fields.email);
});
