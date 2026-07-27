import { defineRegleOptions, RegleVuePlugin } from '@regle/core';
import { defineRegleSchemaConfig, useRegleSchema } from '@regle/schemas';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, ref } from 'vue';
import { z } from 'zod/v4';

declare module '@regle/core' {
  interface CustomFieldProperties {
    $isEmpty: boolean;
  }
}

const options = defineRegleOptions({
  modifiers: {
    autoDirty: false,
  },
  shortcuts: {
    fields: {
      $isEmpty: (field) => !field.$value,
    },
  },
});

describe('useRegleSchema with plugin global config', () => {
  it('should apply plugin modifiers and shortcuts to useRegleSchema', async () => {
    const component = defineComponent({
      setup() {
        const form = ref({ email: '' });
        const { r$ } = useRegleSchema(form, z.object({ email: z.email() }));
        return { r$ };
      },
      template: '<div></div>',
    });

    const { vm } = mount(component, {
      global: {
        plugins: [[RegleVuePlugin, options]],
      },
    });

    expect(vm.r$.email.$isEmpty).toBe(true);

    vm.r$.$value.email = 'foo';
    await nextTick();

    // autoDirty: false — value change before first validation should not dirty the field
    expect(vm.r$.email.$dirty).toBe(false);
    expect(vm.r$.email.$isEmpty).toBe(false);
  });

  it('should let defineRegleSchemaConfig override plugin modifiers', async () => {
    const { useRegleSchema: useConfiguredSchema } = defineRegleSchemaConfig({
      modifiers: {
        autoDirty: true,
      },
    });

    const component = defineComponent({
      setup() {
        const form = ref({ email: '' });
        const { r$ } = useConfiguredSchema(form, z.object({ email: z.email() }));
        return { r$ };
      },
      template: '<div></div>',
    });

    const { vm } = mount(component, {
      global: {
        plugins: [[RegleVuePlugin, options]],
      },
    });

    vm.r$.$value.email = 'foo';
    await nextTick();

    // composable-level autoDirty: true wins over plugin autoDirty: false
    expect(vm.r$.email.$dirty).toBe(true);
  });

  it('should let per-call options override both plugin and composable config', async () => {
    const { useRegleSchema: useConfiguredSchema } = defineRegleSchemaConfig({
      modifiers: {
        autoDirty: true,
      },
    });

    const component = defineComponent({
      setup() {
        const form = ref({ email: '' });
        const { r$ } = useConfiguredSchema(form, z.object({ email: z.email() }), { autoDirty: false });
        return { r$ };
      },
      template: '<div></div>',
    });

    const { vm } = mount(component, {
      global: {
        plugins: [[RegleVuePlugin, options]],
      },
    });

    vm.r$.$value.email = 'foo';
    await nextTick();

    expect(vm.r$.email.$dirty).toBe(false);
  });
});
