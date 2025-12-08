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

    vm.r$.$value.tags = ['foo-bar'] as any;
    await vm.$nextTick();

    expect(vm.r$.tags.$error).toBe(true);
    expect(vm.r$.tags.$each[0].$error).toBe(true);
    expect(vm.r$.$errors.tags.$each[0]).toStrictEqual(['Custom message']);

    await vm.r$.$validate();
    await vm.$nextTick();

    expect(vm.r$.usernames.$error).toBe(true);
    expect(vm.r$.usernames.$errors.$self).toStrictEqual(['Array too short']);
    expect(vm.r$.$errors.usernames.$self).toStrictEqual(['Array too short']);

    expectTypeOf(vm.r$.usernames.$errors.$self).toEqualTypeOf<string[]>();
    expectTypeOf(vm.r$.$errors.usernames.$self).toEqualTypeOf<string[]>();

    vm.r$.$value.usernames = ['foo-bar'];
    await vm.$nextTick();

    // expect(vm.r$.usernames.$error).toBe(false);
    expect(vm.r$.usernames.$errors.$self).toStrictEqual([]);
  });
});
