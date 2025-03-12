import type { RegleShortcutDefinition } from '@regle/core';
import { type RegleSchemaFieldStatus } from '@regle/schemas';
import { isVueSuperiorOrEqualTo3dotFive } from '../../../../packages/core/src/utils';
import { createRegleComponent } from '../../../utils/test.utils';
import {
  shouldBeErrorField,
  shouldBeInvalidField,
  shouldBeUnRuledSchemaCorrectField,
  shouldBeValidField,
} from '../../../utils/validations.utils';
import { MyEnum, valibotUnionsFixture } from './fixtures/valibot.fixture';
import { zodUnionsFixture } from './fixtures/zod.fixture';

describe.each([
  ['valibot', valibotUnionsFixture],
  ['zod', zodUnionsFixture],
])('schemas (%s) - unions types', (name, regleSchema) => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should behave correctly with unions, nums, and discriminated unions', async () => {
    const { vm } = createRegleComponent(regleSchema);

    shouldBeInvalidField(vm.r$.$fields.enum);
    shouldBeInvalidField(vm.r$.$fields.nativeEnum);
    shouldBeInvalidField(vm.r$.$fields.union);
    shouldBeInvalidField(vm.r$.$fields.gift);
    shouldBeInvalidField(vm.r$.$fields.date);

    vm.r$.$value.enum = 'Salmon';
    vm.r$.$value.nativeEnum = MyEnum.Foo;
    vm.r$.$value.union = 6;
    vm.r$.$value.date = '1995-01-08';

    if (vm.r$.$fields.gift) {
      vm.r$.$fields.gift.$fields.type.$value = 'Cash';
    }

    await vm.$nextTick();
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.enum);
    shouldBeValidField(vm.r$.$fields.nativeEnum);
    shouldBeValidField(vm.r$.$fields.union);
    shouldBeValidField(vm.r$.$fields.date);
    shouldBeErrorField(vm.r$.$fields.gift);

    if (vm.r$.$fields.gift) {
      vm.r$.$fields.gift.$value.amount = 100;
    }
    await vm.$nextTick();
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.gift);
    expect(vm.r$.$fields.gift?.$fields.type.$value).toBe('Cash');
    shouldBeValidField(vm.r$.$fields.gift?.$fields.type);
    shouldBeValidField(vm.r$.$fields.gift?.$fields.amount);

    if (vm.r$.$fields.gift) {
      vm.r$.$fields.gift.$fields.type.$value = 'Shares';
    }
    await vm.$nextTick();
    await vm.$nextTick();

    if (vm.r$.$fields.gift) {
      vm.r$.$fields.gift.$value.company = 'Regle';
      vm.r$.$fields.gift.$value.shares = 100;
    }

    await vm.$nextTick();
    await vm.$nextTick();
    await vm.$nextTick();

    if (isVueSuperiorOrEqualTo3dotFive) {
      shouldBeValidField(vm.r$.$fields.gift);
      expect(vm.r$.$value.gift?.type).toBe('Shares');
      shouldBeValidField(vm.r$.$fields.gift?.$fields.company);
      shouldBeValidField(vm.r$.$fields.gift?.$fields.shares);
    }

    const [{ valid }] = await Promise.all([vm.r$.$validate(), vi.advanceTimersByTimeAsync(200)]);

    if (vm.r$.$fields.gift) {
      vm.r$.$fields.gift.$fields.type.$value = undefined as any;
    }
    await vm.$nextTick();
    await vm.$nextTick();

    expect(valid).toBe(true);

    shouldBeErrorField(vm.r$.$fields.gift);
    shouldBeErrorField(vm.r$.$fields.gift?.$fields.type);
    expect(vm.r$.$value.gift?.type).toBe(undefined);
    // Can't remove the "valid" as we cannot know if the field is supposed to have a validation
    shouldBeUnRuledSchemaCorrectField(vm.r$.$fields.gift?.$fields.company);
    shouldBeUnRuledSchemaCorrectField(vm.r$.$fields.gift?.$fields.shares);
    shouldBeUnRuledSchemaCorrectField(vm.r$.$fields.gift?.$fields.amount);

    expectTypeOf(vm.r$.$fields.gift?.$fields.company).toEqualTypeOf<
      RegleSchemaFieldStatus<string, string | undefined, RegleShortcutDefinition<any>> | undefined
    >();
    expectTypeOf(vm.r$.$fields.gift?.$fields.amount).toEqualTypeOf<
      RegleSchemaFieldStatus<number, number | undefined, RegleShortcutDefinition<any>> | undefined
    >();
    expectTypeOf(vm.r$.$fields.gift?.$fields.shares).toEqualTypeOf<
      RegleSchemaFieldStatus<number, number | undefined, RegleShortcutDefinition<any>> | undefined
    >();

    // @ts-expect-error Invalid type on purpose
    vm.r$.$value.enum = 'Not valid';
    // @ts-expect-error Invalid type on purpose
    vm.r$.$value.nativeEnum = 'Not valid';
    // @ts-expect-error Invalid type on purpose
    vm.r$.$value.union = false;
    await vm.$nextTick();

    if (isVueSuperiorOrEqualTo3dotFive) {
      shouldBeErrorField(vm.r$.$fields.enum);
      shouldBeErrorField(vm.r$.$fields.nativeEnum);
      shouldBeErrorField(vm.r$.$fields.union);
    }
  });
});
