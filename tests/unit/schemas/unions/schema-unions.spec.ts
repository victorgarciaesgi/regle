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
import { zod4UnionsFixture } from './fixtures/zod4.fixture';
import { narrowVariant } from '@regle/core';

describe.each([
  ['zod', zodUnionsFixture],
  ['valibot', valibotUnionsFixture],
  ['zod4', zod4UnionsFixture],
])('schemas (%s) - unions types', (name, regleSchema) => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should behave correctly with unions, nums, and discriminated unions', async () => {
    // @ts-expect-error Invalid InferInput type on Standard Schema
    const { vm } = createRegleComponent(regleSchema);

    shouldBeInvalidField(vm.r$.enum);
    shouldBeInvalidField(vm.r$.nativeEnum);
    shouldBeInvalidField(vm.r$.union);
    shouldBeInvalidField(vm.r$.gift);
    shouldBeInvalidField(vm.r$.date);

    vm.r$.$value.enum = 'Salmon';
    vm.r$.$value.nativeEnum = MyEnum.Foo;
    vm.r$.$value.union = 6;
    vm.r$.$value.date = '1995-01-08';

    if (vm.r$.gift) {
      vm.r$.gift.type.$value = 'Cash';
    }

    await vm.$nextTick();
    await vm.$nextTick();

    shouldBeValidField(vm.r$.enum);
    shouldBeValidField(vm.r$.nativeEnum);
    shouldBeValidField(vm.r$.union);
    shouldBeValidField(vm.r$.date);
    shouldBeInvalidField(vm.r$.gift);

    if (vm.r$.gift) {
      vm.r$.gift.$value.amount = 100;
    }
    await vm.$nextTick();
    await vm.$nextTick();

    shouldBeValidField(vm.r$.gift);
    expect(vm.r$.gift?.type.$value).toBe('Cash');
    shouldBeValidField(vm.r$.gift?.type);
    shouldBeValidField(vm.r$.gift?.amount);

    if (vm.r$.gift) {
      vm.r$.gift.type.$value = 'Shares';
    }
    await vm.$nextTick();
    await vm.$nextTick();

    if (vm.r$.gift) {
      vm.r$.gift.$value.company = 'Regle';
      vm.r$.gift.$value.shares = 100;
    }

    await vm.$nextTick();
    await vm.$nextTick();
    await vm.$nextTick();

    if (isVueSuperiorOrEqualTo3dotFive) {
      shouldBeValidField(vm.r$.gift);
      expect(vm.r$.$value.gift?.type).toBe('Shares');
      shouldBeValidField(vm.r$.gift?.company);
      shouldBeValidField(vm.r$.gift?.shares);
    }

    const [{ valid }] = await Promise.all([vm.r$.$validate(), vi.advanceTimersByTimeAsync(200)]);

    if (vm.r$.gift) {
      vm.r$.gift.type.$value = undefined as any;
    }
    await vm.$nextTick();
    await vm.$nextTick();

    expect(valid).toBe(true);

    if (narrowVariant(vm.r$.gift, 'type', 'Cash')) {
      expectTypeOf(vm.r$.gift.amount.$value).toEqualTypeOf<number>();
      expectTypeOf(vm.r$.gift.shares?.$value).toEqualTypeOf<number | undefined>();
    } else if (narrowVariant(vm.r$.gift, 'type', 'Shares')) {
      expectTypeOf(vm.r$.gift.shares.$value).toEqualTypeOf<number>();
      expectTypeOf(vm.r$.gift.company.$value).toEqualTypeOf<string>();
    } else {
      expectTypeOf(vm.r$.gift.type.$value).toEqualTypeOf<'Cash' | 'Shares'>();
      expectTypeOf(vm.r$.gift.amount?.$value).toEqualTypeOf<number | undefined>();
      expectTypeOf(vm.r$.gift.shares?.$value).toEqualTypeOf<number | undefined>();
    }

    shouldBeErrorField(vm.r$.gift);
    shouldBeErrorField(vm.r$.gift?.type);
    expect(vm.r$.$value.gift?.type).toBe(undefined);
    // Can't remove the "valid" as we cannot know if the field is supposed to have a validation
    shouldBeUnRuledSchemaCorrectField(vm.r$.gift?.company);
    shouldBeUnRuledSchemaCorrectField(vm.r$.gift?.shares);
    shouldBeUnRuledSchemaCorrectField(vm.r$.gift?.amount);

    expectTypeOf(vm.r$.gift?.company).toEqualTypeOf<
      RegleSchemaFieldStatus<string, RegleShortcutDefinition<any>> | undefined
    >();
    expectTypeOf(vm.r$.gift?.amount).toEqualTypeOf<
      RegleSchemaFieldStatus<number, RegleShortcutDefinition<any>> | undefined
    >();
    expectTypeOf(vm.r$.gift?.shares).toEqualTypeOf<
      RegleSchemaFieldStatus<number, RegleShortcutDefinition<any>> | undefined
    >();

    // @ts-expect-error Invalid type on purpose
    vm.r$.$value.enum = 'Not valid';
    // @ts-expect-error Invalid type on purpose
    vm.r$.$value.nativeEnum = 'Not valid';
    // @ts-expect-error Invalid type on purpose
    vm.r$.$value.union = false;
    await vm.$nextTick();

    if (isVueSuperiorOrEqualTo3dotFive) {
      shouldBeErrorField(vm.r$.enum);
      shouldBeErrorField(vm.r$.nativeEnum);
      shouldBeErrorField(vm.r$.union);
    }
  });
});
