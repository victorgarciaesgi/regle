import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBeInvalidField, shouldBeValidField } from '../../../utils/validations.utils';
import { arkTypeSingleFieldFixture } from './fixtures/arktype.fixture';
import { valibotSingleFieldFixture } from './fixtures/valibot.fixture';
import { zodSingleFieldFixture } from './fixtures/zod.fixture';

describe.each([
  ['valibot', valibotSingleFieldFixture],
  ['zod', zodSingleFieldFixture],
  ['arktype', arkTypeSingleFieldFixture],
])('single field schema (%s) ', async (name, regleSchema) => {
  it('should behave like a object state', async () => {
    const { vm } = createRegleComponent(regleSchema);

    shouldBeInvalidField(vm.r$);

    vm.r$.$value = 0;
    await vm.$nextTick();

    shouldBeValidField(vm.r$);

    vm.r$.$value = 'foo' as any;
    await vm.$nextTick();

    shouldBeErrorField(vm.r$);

    vm.r$.$reset();
    await vm.$nextTick();

    shouldBeInvalidField(vm.r$);

    const { valid, data } = await vm.r$.$validate();

    expect(valid).toBe(false);
  });
});
