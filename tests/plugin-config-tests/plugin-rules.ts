import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { defineRegleOptions, RegleVuePlugin, useRegle, createRule } from '@regle/core';
import { required, withMessage } from '@regle/rules';

const customRule = createRule({
  validator: (value: unknown, args: number) => value === 'custom',
  message: 'Custom rule',
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
    required: withMessage(required, 'Coucou'),
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
  it('should be able to use custom rules', () => {
    const component = defineComponent({
      setup() {
        const { r$ } = useRegle({ name: '' }, { name: { required, customRule: customRule(1) } });

        useRegle({ name: '' }, { name: { required, minLength: required } });

        return {
          r$,
        };
      },
      template: '<div></div>',
    });

    const vm = mount(component, {
      global: {
        plugins: [[RegleVuePlugin, { options }]],
      },
    });
  });
});
