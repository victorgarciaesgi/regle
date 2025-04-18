import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeInvalidField, shouldBeValidField } from '../../../utils/validations.utils';
import { valibotGlobalConfigFixture } from './fixtures/valibot.fixture';
import { zodGlobalConfigFixture } from './fixtures/zod.fixture';
import { zod4GlobalConfigFixture } from './fixtures/zod4.fixture';

describe.each([
  ['valibot', valibotGlobalConfigFixture],
  ['zod', zodGlobalConfigFixture],
  ['zod4', zod4GlobalConfigFixture],
])('schemas (%s) - defineRegleSchemaConfig rules', (name, regleSchema) => {
  it('should display global errors instead of rule-defined error', async () => {
    const { vm } = createRegleComponent(regleSchema);

    shouldBeInvalidField(vm.r$.$fields.level0);
    shouldBeInvalidField(vm.r$.$fields.level1.$fields.level2.$fields.child);
    shouldBeInvalidField(vm.r$.$fields.collection.$each[0].$fields.name);

    vm.r$.$value = {
      level0: 'foo',
      level1: {
        level2: {
          child: 'foo',
        },
      },
      collection: [{ name: 'foo' }, { name: '' }],
    };

    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.level0);
    shouldBeValidField(vm.r$.$fields.level1.$fields.level2.$fields.child);
    shouldBeValidField(vm.r$.$fields.collection.$each[0].$fields.name);

    vm.condition = false;
    await vm.$nextTick();
  });
});
