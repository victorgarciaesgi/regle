import { nextTick } from 'vue';
import { createRegleComponent } from '../../../../utils/test.utils';
import { shouldBeErrorField, shouldBeInvalidField, shouldBeValidField } from '../../../../utils/validations.utils';
import { arktypeAutoDirtyLocalFixture } from './fixtures/arktype.fixture';
import { valibotAutoDirtyLocalFixture } from './fixtures/valibot.fixture';
import { zodAutoDirtyLocalFixture } from './fixtures/zod.fixture';

describe.each([
  ['zod - local modifier', zodAutoDirtyLocalFixture],
  ['valibot - local modifier', valibotAutoDirtyLocalFixture],
  ['arktype - local modifier', arktypeAutoDirtyLocalFixture],
])('schemas $autoDirty -> false - %s', (name, regleSchemaFixture) => {
  it('should not update the $dirty state to true when value changes before first validation', async () => {
    const { vm } = await createRegleComponent(regleSchemaFixture);

    shouldBeInvalidField(vm.r$.email);
    shouldBeInvalidField(vm.r$.user.firstName);
    shouldBeInvalidField(vm.r$.user.lastName);
    shouldBeInvalidField(vm.r$.contacts.$each[0]);

    vm.r$.$value.email = 'foo';
    await nextTick();
    shouldBeInvalidField(vm.r$.email);

    vm.r$.$validate();
    await nextTick();
    shouldBeErrorField(vm.r$.email);

    vm.r$.$value.email = 'foo@gmail.com';
    await nextTick();
    shouldBeValidField(vm.r$.email);

    vm.r$.$value.email = 'foo';
    await nextTick();
    shouldBeErrorField(vm.r$.email);
  });

  it('should not update the `$dirty` state to `true`, even after `$reset`', async () => {
    const { vm } = await createRegleComponent(regleSchemaFixture);

    vm.r$.$value.email = 'foo';
    await nextTick();
    shouldBeInvalidField(vm.r$.email);

    vm.r$.$reset();
    expect(vm.r$.email.$dirty).toBe(false);

    vm.r$.$value.email = 'bar';
    await nextTick();
    shouldBeInvalidField(vm.r$.email);

    vm.r$.$validate();
    await nextTick();

    shouldBeErrorField(vm.r$.email);

    vm.r$.$value.email = 'bar@free.fr';
    await nextTick();
    shouldBeValidField(vm.r$.email);
  });
});
