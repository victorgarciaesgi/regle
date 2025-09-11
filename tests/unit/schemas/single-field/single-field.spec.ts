import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBeInvalidField, shouldBeValidField } from '../../../utils/validations.utils';
import { arkTypeSingleFieldFixture } from './fixtures/arktype.fixture';
import { valibotSingleFieldFixture } from './fixtures/valibot.fixture';
import { zodSingleFieldFixture } from './fixtures/zod.fixture';
import { zod4SingleFieldFixture } from './fixtures/zod4.fixture';

describe.each([
  ['valibot', valibotSingleFieldFixture],
  ['zod', zodSingleFieldFixture],
  ['arktype', arkTypeSingleFieldFixture],
  ['zod4', zod4SingleFieldFixture],
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

    const { valid } = await vm.r$.$validate();

    expect(valid).toBe(false);
  });
});
