import { nextTick } from 'vue';
import { createRegleComponent } from '../../../../utils/test.utils';
import { shouldBeErrorField, shouldBePristineField, shouldBeValidField } from '../../../../utils/validations.utils';
import { arktypeRewardEarlyFixture } from './fixtures/arktype.fixture';
import { valibotRewardEarlyFixture } from './fixtures/valibot.fixture';
import { zodRewardEarlyFixture } from './fixtures/zod.fixture';
import { useRegleSchema } from '@regle/schemas';
import z from 'zod';

describe.each([
  ['zod', zodRewardEarlyFixture],
  ['valibot', valibotRewardEarlyFixture],
  ['arktype', arktypeRewardEarlyFixture],
])('schemas $rewardEarly - %s', (name, regleSchemaFixture) => {
  it('does not validate until manually called', async () => {
    const { vm } = await createRegleComponent(regleSchemaFixture);

    shouldBePristineField(vm.r$.email);
    shouldBePristineField(vm.r$.user.firstName);
    shouldBePristineField(vm.r$.user.lastName);
    shouldBePristineField(vm.r$.contacts.$each[0].name);

    vm.r$.$value.email = 'invalid-email';
    await nextTick();

    shouldBePristineField(vm.r$.email);

    vm.r$.$validate();
    await nextTick();

    shouldBeErrorField(vm.r$.email);
  });

  it('sets state as normal, stops validating upon success', async () => {
    const { vm } = await createRegleComponent(regleSchemaFixture);

    // Set invalid value and validate
    vm.r$.$value.email = 'invalid-email';
    await nextTick();
    vm.r$.$validate();
    await nextTick();

    shouldBeErrorField(vm.r$.email);

    // Change to another invalid value - should still show error
    vm.r$.$value.email = 'still-invalid';
    await nextTick();
    shouldBeErrorField(vm.r$.email);

    // Change to valid value - should become valid
    vm.r$.$value.email = 'valid@email.com';
    await nextTick();
    shouldBeValidField(vm.r$.email);

    // Change to invalid value again - should stay "valid" (reward early behavior)
    vm.r$.$value.email = 'invalid-again';
    await nextTick();
    shouldBeValidField(vm.r$.email);
  });

  it('works with nested objects', async () => {
    const { vm } = await createRegleComponent(regleSchemaFixture);

    // Validate all fields first
    vm.r$.$validate();
    await nextTick();

    // All should be in error state since they're empty
    shouldBeErrorField(vm.r$.email);
    shouldBeErrorField(vm.r$.user.firstName);
    shouldBeErrorField(vm.r$.user.lastName);
    shouldBeErrorField(vm.r$.contacts.$each[0].name);

    // Set valid values
    vm.r$.email.$value = 'test@email.com';
    vm.r$.user.firstName.$value = 'John';
    vm.r$.user.lastName.$value = 'Doe';
    vm.r$.contacts.$each[0].name.$value = 'Contact';

    await nextTick();

    // All should be valid now
    shouldBeValidField(vm.r$.email);
    shouldBeValidField(vm.r$.user.firstName);
    shouldBeValidField(vm.r$.user.lastName);
    shouldBeValidField(vm.r$.contacts.$each[0].name);

    // Set invalid values - should stay "valid" due to reward early
    vm.r$.email.$value = 'bad';
    vm.r$.user.firstName.$value = '';
    vm.r$.user.lastName.$value = '';
    vm.r$.contacts.$each[0].name.$value = '';
    await nextTick();

    shouldBeValidField(vm.r$.email);
    shouldBeValidField(vm.r$.user.firstName, false);
    shouldBeValidField(vm.r$.user.lastName, false);
    shouldBeValidField(vm.r$.contacts.$each[0].name, false);

    // After re-validation, should show errors again
    await vm.r$.$validate();
    await nextTick();

    shouldBeErrorField(vm.r$.email);
    shouldBeErrorField(vm.r$.user.firstName);
    shouldBeErrorField(vm.r$.user.lastName);
    shouldBeErrorField(vm.r$.contacts.$each[0].name);
  });

  it('should reset reward early state after $reset', async () => {
    const { vm } = await createRegleComponent(regleSchemaFixture);

    // Validate and set valid value
    vm.r$.$value.email = 'invalid';
    vm.r$.$validate();
    await nextTick();
    shouldBeErrorField(vm.r$.email);

    vm.r$.$value.email = 'valid@email.com';
    await nextTick();
    shouldBeValidField(vm.r$.email);

    // Reset
    vm.r$.$reset();
    await nextTick();

    // After reset, should be back to invalid (pristine) state
    shouldBePristineField(vm.r$.email);

    // Changing value should not trigger validation
    vm.r$.$value.email = 'another-invalid';
    await nextTick();
    shouldBePristineField(vm.r$.email);
  });
});

describe('schemas $rewardEarly - Empty state', () => {
  it('should work with zod', async () => {
    function regleSchemaFixture() {
      const form = {};
      return useRegleSchema(form, z.object({ email: z.string().email() }), { rewardEarly: true });
    }
    const { vm } = await createRegleComponent(regleSchemaFixture);

    await vm.r$.$validate();
    await nextTick();

    shouldBeErrorField(vm.r$.email);

    vm.r$.$value.email = 'valid@email.com';
    await nextTick();
    shouldBeValidField(vm.r$.email);
  });
});
