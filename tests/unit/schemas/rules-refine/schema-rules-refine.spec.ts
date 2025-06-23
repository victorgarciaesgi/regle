import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBeValidField } from '../../../utils/validations.utils';
import { valibotRulesRefineFixture } from './fixtures/valibot.fixture';
import { zodRulesRefineFixture } from './fixtures/zod.fixture';
import { zod4RulesRefineFixture } from './fixtures/zod4.fixture';

describe.each([
  ['valibot', valibotRulesRefineFixture],
  ['zod', zodRulesRefineFixture],
  // ['zod4', zod4RulesRefineFixture],
])('schemas (%s) - rules refinements ', async (name, regleSchema) => {
  it('should take refinements in schemas', async () => {
    const { vm } = createRegleComponent(regleSchema);

    vm.r$.$value.password = 'a';
    await vm.$nextTick();
    vm.r$.$value.nested.confirm = 'b';
    await vm.$nextTick();

    shouldBeValidField(vm.r$.password);
    shouldBeValidField(vm.r$.password);
    expect(vm.r$.password.$errors).toStrictEqual([]);
    expect(vm.r$.password.$errors).toStrictEqual([]);
    expect(vm.r$.nested.confirm.$errors).toStrictEqual([
      'Confirm length should be > 2',
      'Value must be "bar"',
      'Password and confirm must match',
    ]);
    shouldBeErrorField(vm.r$.nested.confirm);
    shouldBeErrorField(vm.r$.nested.confirm);
    expect(vm.r$.nested.confirm.$errors).toStrictEqual([
      'Confirm length should be > 2',
      'Value must be "bar"',
      'Password and confirm must match',
    ]);
    expect(vm.r$.nested.confirm.$errors).toStrictEqual([
      'Confirm length should be > 2',
      'Value must be "bar"',
      'Password and confirm must match',
    ]);

    vm.r$.$value.nested.confirm = 'bar';
    await vm.$nextTick();

    shouldBeValidField(vm.r$.password);
    shouldBeValidField(vm.r$.password);
    expect(vm.r$.password.$errors).toStrictEqual([]);
    expect(vm.r$.password.$errors).toStrictEqual([]);

    shouldBeErrorField(vm.r$.nested.confirm);
    shouldBeErrorField(vm.r$.nested.confirm);
    expect(vm.r$.nested.confirm.$errors).toStrictEqual(['Password and confirm must match']);
    expect(vm.r$.nested.confirm.$errors).toStrictEqual(['Password and confirm must match']);

    vm.r$.$value.password = 'bar';
    await vm.$nextTick();

    shouldBeValidField(vm.r$.nested.confirm);
    shouldBeValidField(vm.r$.nested.confirm);
    shouldBeValidField(vm.r$.nested);
    shouldBeValidField(vm.r$.nested);
    expect(vm.r$.nested.confirm.$errors).toStrictEqual([]);
    expect(vm.r$.nested.confirm.$errors).toStrictEqual([]);

    vm.r$.$value.collection[0].child = 'a';
    await vm.$nextTick();

    shouldBeErrorField(vm.r$.collection.$self);
    shouldBeErrorField(vm.r$.collection.$self);
    expect(vm.r$.collection.$self.$errors).toStrictEqual(['All items children length must be min 3']);
    expect(vm.r$.collection.$self.$errors).toStrictEqual(['All items children length must be min 3']);
    shouldBeErrorField(vm.r$.collection.$each[0].child);
    shouldBeErrorField(vm.r$.collection.$each[0].child);
    expect(vm.r$.collection.$each[0].child.$errors).toStrictEqual(['First item must be "foo"']);
    expect(vm.r$.collection.$each[0].child.$errors).toStrictEqual(['First item must be "foo"']);

    vm.r$.$value.collection.push({ child: 'bar' });
    await vm.$nextTick();
    vm.r$.collection.$each[1].$touch();
    await vm.$nextTick();

    shouldBeValidField(vm.r$.collection.$each[1].child);
    shouldBeValidField(vm.r$.collection.$each[1].child);
    expect(vm.r$.collection.$each[1].child.$errors).toStrictEqual([]);
    expect(vm.r$.collection.$each[1].child.$errors).toStrictEqual([]);

    vm.r$.$value.collection[0].child = 'foo';
    await vm.$nextTick();

    shouldBeValidField(vm.r$.collection.$self);
    shouldBeValidField(vm.r$.collection.$self);
    expect(vm.r$.collection.$self.$errors).toStrictEqual([]);
    shouldBeValidField(vm.r$.collection.$each[0].child);
    expect(vm.r$.collection.$each[0].child.$errors).toStrictEqual([]);

    vm.r$.$value.collection.splice(0, 1);
    await vm.$nextTick();

    shouldBeValidField(vm.r$.collection.$self);
    expect(vm.r$.collection.$self.$errors).toStrictEqual([]);
    shouldBeErrorField(vm.r$.collection.$each[0].child);
    expect(vm.r$.collection.$each[0].child.$errors).toStrictEqual(['First item must be "foo"']);
  });
});
