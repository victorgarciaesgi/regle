import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBeValidField } from '../../../utils/validations.utils';
import { valibotWithDepsFixture } from './fixtures/valibot.fixture';
import { zodWithDepsFixture } from './fixtures/zod.fixture';
import { zod4WithDepsFixture } from './fixtures/zod4.fixture';

describe.each([
  ['valibot', valibotWithDepsFixture],
  ['zod', zodWithDepsFixture],
  ['zod4', zod4WithDepsFixture],
])('schemas (%s) - withDeps', async (name, regleSchema) => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const { vm } = createRegleComponent(regleSchema);

  it('should update computed schema when forced dep changes', async () => {
    vm.r$.$value.nested.field2 = 'Hello';
    await vm.$nextTick();
    shouldBeValidField(vm.r$.nested.field2);

    vm.r$.$value.field1 = 'Hello';
    await vm.$nextTick();
    shouldBeErrorField(vm.r$.nested.field2);

    vm.r$.$value.nested.field2 = 'Foo';
    await vm.$nextTick();
    shouldBeValidField(vm.r$.nested.field2);

    vm.r$.$value.field1 = 'Foo';
    await vm.$nextTick();
    shouldBeErrorField(vm.r$.nested.field2);
  });
});
