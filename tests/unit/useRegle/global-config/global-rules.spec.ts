import { defineRegleConfig, extendRegleConfig, type Maybe } from '@regle/core';
import { and, applyIf, minValue, not, or, required, sameAs, withMessage } from '@regle/rules';
import { ref } from 'vue';
import { ruleMockIsEven, ruleMockMetadata } from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';

const { useRegle: useCustomRegle } = defineRegleConfig({
  rules: () => ({
    minValue: withMessage(minValue, ({ $params: [min] }) => `Patched min:${min}`),
    sameAs: withMessage(sameAs, ({ $params: [_, otherName] }) => {
      return `Not same as ${otherName}`;
    }),
    rule: withMessage(ruleMockIsEven, 'Patched rule'),
  }),
  shortcuts: {
    fields: {
      $isRequired: (field) => field.$rules.required?.$active ?? false,
    },
  },
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
  password: '',
  confirmPassword: '',
});

function nestedRefObjectValidation() {
  return useCustomRegle(form, () => ({
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
    password: {},
    confirmPassword: { sameAs: sameAs(() => form.value.password, 'password') },
  }));
}

describe('defineRegleConfig rules', () => {
  it('should display global errors instead of rule-defined error', async () => {
    const { vm } = createRegleComponent(nestedRefObjectValidation);

    // @ts-expect-error
    useCustomRegle({ foo: 0 }, { foo: { rule: (_value: Maybe<string>) => true } });

    vm.r$.$touch();

    await vm.$nextTick();

    expect(vm.r$.level0.$errors).toStrictEqual(['Patched rule']);
    expect(vm.r$.level1.child.$errors).toStrictEqual(['Patched rule']);
    expect(vm.r$.level1.level2.child.$errors).toStrictEqual(['Patched min:3', 'Re-patched rule']);

    expect(vm.r$.withApply.$errors).toStrictEqual(['Patched rule']);
    expect(vm.r$.withAnd.$errors).toStrictEqual(['Patched rule']);
    expect(vm.r$.withOr.$errors).toStrictEqual(['Patched rule']);
    expect(vm.r$.withNot.$errors).toStrictEqual(['Patched rule']);

    vm.r$.$value.password = 'foo';
    vm.r$.$value.confirmPassword = 'foobar';
    await vm.$nextTick();

    expect(vm.r$.confirmPassword.$errors).toStrictEqual(['Not same as password']);

    // Ensure types are inferred well
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

describe('extendRegleConfig', () => {
  function extendedConfig() {
    const { useRegle: useExtendRegle } = extendRegleConfig(useCustomRegle, {
      rules: () => ({
        extendedRule: withMessage(ruleMockIsEven, 'Patched rule'),
      }),
    });

    // @ts-expect-error
    useExtendRegle({ foo: 0 }, { foo: { extendedRule: (_value: Maybe<string>) => true } });

    // @ts-expect-error
    useExtendRegle({ foo: 0 }, { foo: { rule: (_value: Maybe<string>) => true } });

    return useExtendRegle(form, () => ({
      withApply: { rule: applyIf(true, ruleMockIsEven), extendedRule: applyIf(true, ruleMockIsEven) },
      withAnd: { rule: and(ruleMockIsEven, minValue(1)) },
      withOr: { rule: or(ruleMockIsEven, minValue(5)) },
      withNot: { rule: not(ruleMockIsEven) },
      level0: { required, rule: ruleMockIsEven },
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
    }));
  }

  it('should correctly augment already existing types', async () => {
    const { vm } = createRegleComponent(extendedConfig);

    vm.r$.$touch();

    await vm.$nextTick();

    expect(vm.r$.$fields.password.$isRequired).toBe(false);
    expect(vm.r$.level0.$errors).toStrictEqual(['Patched rule']);
    expect(vm.r$.level0.$isRequired).toBe(true);
    expect(vm.r$.level1.child.$errors).toStrictEqual(['Patched rule']);
    expect(vm.r$.level1.level2.child.$errors).toStrictEqual(['Patched min:3', 'Re-patched rule']);

    expect(vm.r$.withApply.$errors).toStrictEqual(['Patched rule', 'Patched rule']);
    expect(vm.r$.withAnd.$errors).toStrictEqual(['Patched rule']);
    expect(vm.r$.withOr.$errors).toStrictEqual(['Patched rule']);
    expect(vm.r$.withNot.$errors).toStrictEqual(['Patched rule']);
  });
});
