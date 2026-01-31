import {
  markStatic,
  useRegle,
  type Maybe,
  type MaybeInput,
  type MaybeOutput,
  type RegleFieldStatus,
  type RegleRuleDefinition,
  type RegleShortcutDefinition,
  type RegleStaticImpl,
} from '@regle/core';
import { minValue, required } from '@regle/rules';
import { useRegleSchema } from '@regle/schemas';
import { Decimal } from 'decimal.js';
import type { Raw } from 'vue';
import { z } from 'zod/v4';
import { createRegleComponent } from '../../utils/test.utils';
import { shouldBeErrorField, shouldBeValidField } from '../../utils/validations.utils';

class BigWrapper {
  public value: string;
  constructor(val: string) {
    this.value = val;
  }
}

describe('markStatic', () => {
  it('should parse correctly values marked with markStatic', async () => {
    function staticRegle() {
      return useRegle(
        {
          name: '',
          decimal: markStatic(new Decimal(0)),
          nested: {
            wrapper: markStatic(new BigWrapper('')),
          },
        },
        {
          name: { required },
          decimal: {
            minDecimal: (value: MaybeInput<Decimal>) => {
              expectTypeOf(value).toEqualTypeOf<Maybe<Decimal>>();
              return minValue(10).exec(value?.toNumber() ?? 0);
            },
          },
          nested: { wrapper: { required, checkWrapper: (value) => !!value?.value.includes('test') } },
        }
      );
    }

    const { vm } = createRegleComponent(staticRegle);

    expectTypeOf(vm.r$.$errors.decimal).toEqualTypeOf<string[]>();
    expectTypeOf(vm.r$.$errors.nested.wrapper).toEqualTypeOf<string[]>();
    expectTypeOf(vm.r$.$value.decimal).toEqualTypeOf<RegleStaticImpl<Decimal>>();
    expectTypeOf(vm.r$.$value.nested.wrapper).toEqualTypeOf<RegleStaticImpl<BigWrapper>>();

    expectTypeOf(vm.r$.decimal).toEqualTypeOf<
      RegleFieldStatus<
        Raw<Decimal>,
        {
          minDecimal: (value: Maybe<Raw<Decimal>>) => boolean;
        },
        RegleShortcutDefinition<any>
      >
    >();
    expectTypeOf(vm.r$.decimal.$value).toEqualTypeOf<MaybeOutput<Raw<Decimal>>>();
    expectTypeOf(vm.r$.decimal.$initialValue).toEqualTypeOf<MaybeOutput<Raw<Decimal>>>();
    expectTypeOf(vm.r$.decimal.$originalValue).toEqualTypeOf<MaybeOutput<Raw<Decimal>>>();
    expectTypeOf(vm.r$.decimal.$errors).toEqualTypeOf<string[]>();

    expect(vm.r$.decimal.$rules).toBeDefined();
    expect(vm.r$.decimal.$rules.minDecimal).toBeDefined();

    //

    expectTypeOf(vm.r$.nested.wrapper).toEqualTypeOf<
      RegleFieldStatus<
        Raw<BigWrapper>,
        {
          required: RegleRuleDefinition<'required', unknown, [], false, boolean, unknown, unknown>;
          checkWrapper: (value: Maybe<Raw<BigWrapper>>) => boolean;
        },
        RegleShortcutDefinition<any>
      >
    >();
    expectTypeOf(vm.r$.nested.wrapper.$value).toEqualTypeOf<MaybeOutput<Raw<BigWrapper>>>();

    expect(vm.r$.nested.wrapper.$rules).toBeDefined();
    expect(vm.r$.nested.wrapper.$rules.checkWrapper).toBeDefined();

    vm.r$.decimal.$value = new Decimal(3);
    vm.r$.nested.wrapper.$value = new BigWrapper('bar');
    await vm.$nextTick();

    shouldBeErrorField(vm.r$.decimal);
    shouldBeErrorField(vm.r$.nested.wrapper);

    vm.r$.decimal.$value = new Decimal(10);
    vm.r$.nested.wrapper.$value = new BigWrapper('test');
    vm.r$.name.$value = 'zzrf';
    await vm.$nextTick();

    shouldBeValidField(vm.r$.decimal);
    shouldBeValidField(vm.r$.nested.wrapper);

    const { data, valid } = await vm.r$.$validate();

    if (valid) {
      expectTypeOf(data).toEqualTypeOf<{
        decimal?: MaybeOutput<RegleStaticImpl<Decimal>>;
        name: string;
        nested: {
          wrapper: RegleStaticImpl<BigWrapper>;
        };
      }>();
    }
  });

  it('should work with schemas', async () => {
    const StaticDecimal = markStatic(Decimal);
    const StaticBigWrapper = markStatic(BigWrapper);

    function staticRegle() {
      const schema = z.object({
        name: z.string(),
        decimal: z.instanceof(StaticDecimal).refine((value) => value.toNumber() > 10),
        nested: z.object({
          wrapper: z.instanceof(StaticBigWrapper).refine((value) => value.value.includes('test')),
        }),
      });

      return useRegleSchema(
        {
          name: '',
          decimal: markStatic(new StaticDecimal(0)),
          nested: {
            wrapper: markStatic(new StaticBigWrapper('')),
          },
        },
        schema
      );
    }

    const { vm } = createRegleComponent(staticRegle);

    expectTypeOf(vm.r$.$errors.decimal).toEqualTypeOf<string[]>();
    expectTypeOf(vm.r$.$errors.nested.wrapper).toEqualTypeOf<string[]>();

    expectTypeOf(vm.r$.$value.decimal).toEqualTypeOf<Raw<RegleStaticImpl<Decimal>>>();
    expectTypeOf(vm.r$.$value.nested.wrapper).toEqualTypeOf<Raw<RegleStaticImpl<BigWrapper>>>();

    expect(vm.r$.decimal).toBeDefined();

    expectTypeOf(vm.r$.decimal.$value).toEqualTypeOf<MaybeOutput<Raw<Decimal>>>();
    expectTypeOf(vm.r$.decimal.$errors).toEqualTypeOf<string[]>();

    vm.r$.decimal.$value = new StaticDecimal(3);
    vm.r$.nested.wrapper.$value = new StaticBigWrapper('bar');
    await vm.$nextTick();

    shouldBeErrorField(vm.r$.decimal);
    shouldBeErrorField(vm.r$.nested.wrapper);

    vm.r$.decimal.$value = new StaticDecimal(11);
    vm.r$.nested.wrapper.$value = new StaticBigWrapper('test');
    vm.r$.name.$value = 'zzrf';
    await vm.$nextTick();

    shouldBeValidField(vm.r$.decimal);
    shouldBeValidField(vm.r$.nested.wrapper);

    const { data, valid } = await vm.r$.$validate();

    if (valid) {
      expectTypeOf(data).toEqualTypeOf<{
        name: string;
        decimal: RegleStaticImpl<Decimal>;
        nested: {
          wrapper: RegleStaticImpl<BigWrapper>;
        };
      }>();
    }
  });
});
