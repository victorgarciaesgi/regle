import { defineRegleConfig, type RegleComputedRules } from '@regle/core';
import { ref } from 'vue';
import { ruleMockIsEven } from '../../../fixtures';
import { minValue, required, withMessage } from '@regle/rules';
import { createRegleComponent } from '../../../utils/test.utils';

function nestedRefObjectValidation() {
  const { useRegle } = defineRegleConfig({
    rules: () => ({
      minValue: withMessage(minValue, (_, { $params: [min] }) => `Patched min:${min}`),
      rule: withMessage(ruleMockIsEven, 'Patched rule'),
    }),
  });
  const form = ref({
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
  });
});
