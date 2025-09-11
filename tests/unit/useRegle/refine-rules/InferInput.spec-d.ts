import { refineRules, type InferInput, type MaybeInput } from '@regle/core';
import { dateBefore, number, numeric, required, string, type } from '@regle/rules';
import { computed, ref } from 'vue';

describe('InferInput should correctly infer state type from a rules object', () => {
  const rules = {
    firstName: { required },
    lastName: {},
    withType: { numeric, type: type<string>() },
    withUnions: { numeric, number },
    string: { string },
    unions: { dateBefore: dateBefore(new Date()) },
    overrideRefine: { numeric },
    collection: {
      $each: {
        name: { string, required },
      },
    },
    super: {
      nested: {
        object: {
          firstName: { required, numeric },
        },
      },
    },
  };

  const refRules = ref(rules);
  const computedRules = computed(() => rules);
  const refinedRules = refineRules(rules, () => ({
    overrideRefine: { type: type<number>() },
  }));

  type ExpectedState = {
    firstName?: unknown;
    lastName?: unknown;
    withType?: MaybeInput<string>;
    withUnions?: MaybeInput<number>;
    string?: MaybeInput<string>;
    unions?: MaybeInput<string | Date>;
    overrideRefine?: MaybeInput<string | number>;
    collection?: { name?: MaybeInput<string> }[];
    super?: { nested?: { object?: { firstName?: MaybeInput<number | string> } } };
  };

  expectTypeOf<InferInput<typeof rules>>().toEqualTypeOf<ExpectedState>();
  expectTypeOf<InferInput<typeof refRules>>().toEqualTypeOf<ExpectedState>();
  expectTypeOf<InferInput<typeof computedRules>>().toEqualTypeOf<ExpectedState>();
  expectTypeOf<InferInput<typeof refinedRules>>().toExtend<
    ExpectedState & {
      overrideRefine?: MaybeInput<number>;
    }
  >();
});
