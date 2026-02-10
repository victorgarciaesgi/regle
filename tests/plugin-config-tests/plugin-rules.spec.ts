import { createRule, defineRegleOptions, RegleVuePlugin, useRegle, type Maybe } from '@regle/core';
import { and, applyIf, isFilled, minValue, not, or, required, sameAs, withMessage } from '@regle/rules';
import { mount } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';

const customRule = createRule({
  validator: (value: unknown, _args: number) => value === 'custom',
  message: 'Custom rule',
});

const ruleMockIsEven = createRule({
  validator(value: Maybe<number>) {
    if (isFilled(value)) {
      return value % 2 === 0;
    }
    return true;
  },
  message: 'Custom error',
});

declare module '@regle/core' {
  interface CustomRules {
    customRule: typeof customRule;
  }
  interface CustomFieldProperties {
    $isRequired: boolean;
  }
  interface CustomNestedProperties {
    $isEmpty: boolean;
  }
  interface CustomCollectionProperties {
    $isEmpty: boolean;
  }
}

const options = defineRegleOptions({
  rules: () => ({
    minValue: withMessage(minValue, ({ $params: [min] }) => `Patched min:${min}`),
    sameAs: withMessage(sameAs, ({ $params: [_, otherName] }) => {
      return `Not same as ${otherName}`;
    }),
    rule: withMessage(ruleMockIsEven, 'Patched rule'),
  }),
  modifiers: {
    autoDirty: false,
  },
  shortcuts: {
    fields: {
      $isRequired: (field) => field.$rules.required?.$active ?? false,
    },
    nested: {
      $isEmpty: (nest) => Object.keys(nest.$fields).length === 0,
    },
    collections: {
      $isEmpty: (collection) => collection.$each.length === 0,
    },
  },
});

describe('augmenting rules with plugin config', () => {
  it('should be able to use custom rules', async () => {
    const component = defineComponent({
      setup() {
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

        const { r$ } = useRegle(form, {
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
        });

        return {
          r$,
        };
      },
      template: '<div></div>',
    });

    const { vm } = mount(component, {
      global: {
        plugins: [[RegleVuePlugin, options]],
      },
    });

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

    expect(vm.r$.$isEmpty).toBeDefined();
    expect(vm.r$.level1.collection.$isEmpty).toBeDefined();
    expect(vm.r$.$fields.confirmPassword.$isRequired).toBeDefined();
  });
});
