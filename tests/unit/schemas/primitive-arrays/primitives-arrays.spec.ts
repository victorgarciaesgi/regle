import { createRegleComponent } from '../../../utils/test.utils';
import { arktypefixture } from './fixtures/arktype.fixture';
import { valibotfixture } from './fixtures/valibot.fixture';
import { zodFixture } from './fixtures/zod.fixture';

describe.each([
  ['valibot', valibotfixture],
  ['zod', zodFixture],
  ['arktype', arktypefixture],
])('primitives arrays (%s) ', async (name, regleSchema) => {
  it('should report errors of primitives arrays', async () => {
    const { vm } = createRegleComponent(regleSchema);

    expect(vm.r$.tags.$error).toBe(false);
    expect(vm.r$.tags.$error).toBe(false);

    vm.r$.$value.tags = ['foo-bar'] as any;
    await vm.$nextTick();

    expect(vm.r$.tags.$error).toBe(true);
    expect(vm.r$.tags.$error).toBe(true);
    expect(vm.r$.tags.$errors).toStrictEqual(['Custom message']);
    expect(vm.r$.tags.$errors).toStrictEqual(['Custom message']);
  });
});
