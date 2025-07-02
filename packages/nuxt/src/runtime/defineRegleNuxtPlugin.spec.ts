/**
 * @vitest-environment happy-dom
 */

import { defineRegleConfig } from '@regle/core';
import { defineRegleNuxtPlugin } from './defineRegleNuxtPlugin';
import { required } from '@regle/rules';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import { withMessage } from '@regle/rules';

describe('defineRegleNuxtPlugin', () => {
  it('should return a function', async () => {
    const config = defineRegleConfig({
      rules: () => ({
        required: withMessage(required, 'foo'),
      }),
      shortcuts: {
        fields: {
          $isRequired: (field) => field.$rules.required?.$active ?? false,
        },
      },
    });

    const plugin = defineRegleNuxtPlugin(() => config);

    expect(plugin).toBeDefined();

    const component = defineComponent({
      setup() {
        const { r$ } = plugin.useRegle({ email: '' }, { email: { required } });
        const { r$: r$2 } = plugin.useScopedRegle({ email: '' }, { email: { required } });
        return { r$, r$2 };
      },
      template: `<div></div>`,
    });

    const { vm } = mount(component);

    vm.r$.$touch();
    await vm.$nextTick();

    expect(vm.r$.$errors.email).toStrictEqual(['foo']);
    expect(vm.r$.email.$isRequired).toBe(true);

    vm.r$2.$touch();
    await vm.$nextTick();

    expect(vm.r$2.$errors.email).toStrictEqual(['foo']);
    expect(vm.r$2.email.$isRequired).toBe(true);
  });
});
