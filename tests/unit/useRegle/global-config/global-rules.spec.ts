import { defineRegleConfig, type RegleComputedRules } from '@regle/core';
import { ref } from 'vue';
import { ruleMockIsEven, ruleMockMetadata } from '../../../fixtures';
import { and, applyIf, minValue, not, or, required, withMessage } from '@regle/rules';
import { createRegleComponent } from '../../../utils/test.utils';

function nestedRefObjectValidation() {
  const { useRegle } = defineRegleConfig({
    rules: () => ({
      minValue: withMessage(minValue, ({ $params: [min] }) => `Patched min:${min}`),
      rule: withMessage(ruleMockIsEven, 'Patched rule'),
    }),
  });
  const form = ref({
    withApply: 1,
    withOr: 1,
    withAnd: 1,
    withNot: 2,
    level0: 1,
    level1: {
      child: 1,
      level2: {
        child: 1,
      },
      collection: [{ name: 1 as number | null }],
    },
  });
  return useRegle(
    form,
    () =>
      ({
        withApply: { rule: applyIf(true, ruleMockIsEven) },
        withAnd: { rule: and(ruleMockIsEven, minValue(1)) },
        withOr: { rule: or(ruleMockIsEven, minValue(5)) },
        withNot: { rule: not(ruleMockIsEven) },
        level0: { rule: ruleMockIsEven },
        level1: {
          child: { rule: ruleMockIsEven },
          level2: {
            child: { minValue: minValue(3), rule: withMessage(ruleMockIsEven, 'Re-patched rule') },
          },
          collection: {
            $each: {
              name: { required, ruleMockIsEven },
            },
          },
        },
      }) satisfies RegleComputedRules<typeof form>
  );
}

describe('defineRegleConfig rules', () => {
  it('should display global errors instead of rule-defined error', async () => {
    const { vm } = createRegleComponent(nestedRefObjectValidation);

    vm.r$.$touch();

    await vm.$nextTick();

    expect(vm.r$.$fields.level0.$errors).toStrictEqual(['Patched rule']);
    expect(vm.r$.$fields.level1.$fields.child.$errors).toStrictEqual(['Patched rule']);
    expect(vm.r$.$fields.level1.$fields.level2.$fields.child.$errors).toStrictEqual([
      'Patched min:3',
      'Re-patched rule',
    ]);

    expect(vm.r$.$fields.withApply.$errors).toStrictEqual(['Patched rule']);
    expect(vm.r$.$fields.withAnd.$errors).toStrictEqual(['Patched rule']);
    expect(vm.r$.$fields.withOr.$errors).toStrictEqual(['Patched rule']);
    expect(vm.r$.$fields.withNot.$errors).toStrictEqual(['Patched rule']);

    // Ensure types are infered well
    defineRegleConfig({
      rules: () => ({
        minValue: withMessage(minValue, ({ $params: [min] }) => {
          expectTypeOf(min).toEqualTypeOf<number>();
          return '';
        }),
        ruleMockMetadata: withMessage(ruleMockMetadata, ({ customData }) => {
          expectTypeOf(customData).toEqualTypeOf<string | undefined>();
          return '';
        }),
        rule: withMessage(ruleMockIsEven, 'Patched rule'),
      }),
    });
  });
});
