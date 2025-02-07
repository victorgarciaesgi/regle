import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBeValidField } from '../../../utils/validations.utils';
import { valibotRulesRefineFixture } from './fixtures/valibot.fixture';
import { zodRulesRefineFixture } from './fixtures/zod.fixture';

describe.each([
  ['valibot', valibotRulesRefineFixture],
  ['zod', zodRulesRefineFixture],
])('schemas (%s) - rules refinements ', async (name, regleSchema) => {
  it('should take refinements in zod schemas', async () => {
    const { vm } = createRegleComponent(regleSchema);

    vm.r$.$value.password = 'a';
    await vm.$nextTick();
    vm.r$.$value.nested.confirm = 'b';
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.password);
    expect(vm.r$.$fields.password.$errors).toStrictEqual([]);
    shouldBeErrorField(vm.r$.$fields.nested.$fields.confirm);
    expect(vm.r$.$fields.nested.$fields.confirm.$errors).toStrictEqual([
      'Confirm length should be > 2',
      'Value must be "bar"',
      'Password and confirm must match',
    ]);

    vm.r$.$value.nested.confirm = 'bar';
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.password);
    expect(vm.r$.$fields.password.$errors).toStrictEqual([]);

    shouldBeErrorField(vm.r$.$fields.nested.$fields.confirm);
    expect(vm.r$.$fields.nested.$fields.confirm.$errors).toStrictEqual(['Password and confirm must match']);

    vm.r$.$value.password = 'bar';
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.nested.$fields.confirm);
    shouldBeValidField(vm.r$.$fields.nested);
    expect(vm.r$.$fields.nested.$fields.confirm.$errors).toStrictEqual([]);

    vm.r$.$value.collection[0].child = 'a';
    await vm.$nextTick();

    shouldBeErrorField(vm.r$.$fields.collection.$self);
    expect(vm.r$.$fields.collection.$self.$errors).toStrictEqual(['All items children length must be min 3']);
    shouldBeErrorField(vm.r$.$fields.collection.$each[0].$fields.child);
    expect(vm.r$.$fields.collection.$each[0].$fields.child.$errors).toStrictEqual(['First item must be "foo"']);

    vm.r$.$value.collection.push({ child: 'bar' });
    await vm.$nextTick();
    vm.r$.$fields.collection.$each[1].$touch();
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.collection.$each[1].$fields.child);
    expect(vm.r$.$fields.collection.$each[1].$fields.child.$errors).toStrictEqual([]);

    vm.r$.$value.collection[0].child = 'foo';
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.collection.$self);
    expect(vm.r$.$fields.collection.$self.$errors).toStrictEqual([]);
    shouldBeValidField(vm.r$.$fields.collection.$each[0].$fields.child);
    expect(vm.r$.$fields.collection.$each[0].$fields.child.$errors).toStrictEqual([]);

    vm.r$.$value.collection.splice(0, 1);
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.collection.$self);
    expect(vm.r$.$fields.collection.$self.$errors).toStrictEqual([]);
    shouldBeErrorField(vm.r$.$fields.collection.$each[0].$fields.child);
    expect(vm.r$.$fields.collection.$each[0].$fields.child.$errors).toStrictEqual(['First item must be "foo"']);
  });
});
