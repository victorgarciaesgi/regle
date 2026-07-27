/**
 * @vitest-environment happy-dom
 */

import { defineRegleConfig, RegleVuePlugin } from '@regle/core';
import { defineRegleNuxtPlugin } from './defineRegleNuxtPlugin';
import { required, withMessage } from '@regle/rules';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';

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
    expect(plugin.__config).toBeDefined();
    expect(plugin.__config?.modifiers).toBeUndefined();

    const component = defineComponent({
      setup() {
        const { r$ } = plugin.useRegle({ email: '' }, { email: { required } });
        const { r$: r$2 } = plugin.useScopedRegle({ email: '' }, { email: { required } });
        return { r$, r$2 };
      },
      template: `<div></div>`,
    });

    const { vm } = mount(component, {
      global: {
        plugins: [RegleVuePlugin],
      },
    });

    vm.r$.$touch();
    await vm.$nextTick();

    expect(vm.r$.$errors.email).toStrictEqual(['foo']);
    expect(vm.r$.email.$isRequired).toBe(true);

    vm.r$2.$touch();
    await vm.$nextTick();

    expect(vm.r$2.$errors.email).toStrictEqual(['foo']);
    expect(vm.r$2.email.$isRequired).toBe(true);
  });

  it('should expose setup-file config on __config for RegleVuePlugin', () => {
    const config = defineRegleConfig({
      modifiers: {
        autoDirty: false,
      },
    });

    const plugin = defineRegleNuxtPlugin(() => config);

    expect(plugin.__config?.modifiers).toStrictEqual({ autoDirty: false });
  });
});
