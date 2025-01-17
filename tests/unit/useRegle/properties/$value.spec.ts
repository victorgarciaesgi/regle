import { simpleNestedStateWithMixedValidation } from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField } from '../../../utils/validations.utils';

it('should update the source value', async () => {
  const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

  vm.r$.$value.email = 'Hello';
  await vm.$nextTick();
  expect(vm.r$.$value.email).toBe('Hello');
  shouldBeErrorField(vm.r$.$fields.email);

  // Setting undefined to nested object should update children invalid status
  vm.r$.$value.user = undefined as any;
  await vm.$nextTick();
  expect(vm.r$.$fields.user.$fields.firstName.$invalid).toBe(true);
});
