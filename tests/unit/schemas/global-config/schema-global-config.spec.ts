import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeInvalidField, shouldBeValidField } from '../../../utils/validations.utils';
import { valibotGlobalConfigFixture } from './fixtures/valibot.fixture';
import { zodGlobalConfigFixture } from './fixtures/zod.fixture';

describe.each([
  ['valibot', valibotGlobalConfigFixture],
  ['zod', zodGlobalConfigFixture],
])('schemas (%s) - defineRegleSchemaConfig rules for Valibot', (name, regleSchema) => {
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
