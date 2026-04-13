import { RegleVuePlugin, useRegle } from '@regle/core';
import { required } from '@regle/rules';
import { inferSchema, useRegleSchema } from '@regle/schemas';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, defineStore, setActivePinia, skipHydrate, storeToRefs } from 'pinia';
import { defineComponent, nextTick, ref } from 'vue';
import { z } from 'zod/v3';
import { shouldBeErrorField, shouldBeInvalidField, shouldBeValidField } from '../../utils/validations.utils';
import { vueVersion } from '../../utils/vueVersion';

describe.runIf(vueVersion === '3.5')('$dispose', () => {
  const useStore = defineStore('store', () => {
    const { r$ } = useRegle(
      { name: 'Hello', nested: { child: '' }, collection: [{ name: '' }] },
      { name: { required: required } }
    );

    function updateValue(value: string) {
      r$.$value.name = value;
    }

    return {
      r$: skipHydrate(r$),
      updateValue,
    };
  });

  const CompoA = defineComponent({
    setup() {
      const testForm = useStore();
      const { r$ } = storeToRefs(testForm);

      return {
        r$,
      };
    },
    template: `
    <input type="text" class="compoA-input" v-model="r$.$value.name" />
    <div class="compoA">{{r$.$value.name}}</div>`,
  });
  const CompoB = defineComponent({ template: '<div class="compoB">Nothing</div>' });
  const ParentCompo = defineComponent({
    components: { CompoA, CompoB },
    setup() {
      const condition = ref(true);

      function handleToggle() {
        condition.value = !condition.value;
      }

      return {
        condition,
        handleToggle,
      };
    },
    template: `
    <CompoA v-if="condition" />
    <CompoB v-else />
  `,
  });

  function createLazyCachedValidationComponents(storeId: string, createValidation: () => { r$: any }) {
    const useLazyStore = defineStore(storeId, () => {
      const validations = ref<{ name: string; validation: { r$: any } }[]>([]);

      function findValidation() {
        return validations.value.find((validation) => validation.name === 'example')?.validation;
      }

      function useValidation() {
        if (!findValidation()) {
          validations.value.push(skipHydrate({ name: 'example', validation: createValidation() }));
        }

        return findValidation()!;
      }

      return {
        useValidation,
      };
    });

    const LazyCompoA = defineComponent({
      setup() {
        const { r$ } = useLazyStore().useValidation();

        return {
          r$,
        };
      },
      template: `
        <input type="text" class="compoA-input" v-model="r$.name.$value" />
        <div class="compoA">{{r$.name.$value}}</div>
      `,
    });

    const LazyParentCompo = defineComponent({
      components: { LazyCompoA, CompoB },
      setup() {
        const condition = ref(true);

        function handleToggle() {
          condition.value = !condition.value;
        }

        return {
          condition,
          handleToggle,
        };
      },
      template: `
        <LazyCompoA v-if="condition" />
        <CompoB v-else />
      `,
    });

    return {
      LazyCompoA,
      LazyParentCompo,
    };
  }
  it('it should not break when disposing a store', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const element = mount(ParentCompo, {
      global: {
        plugins: [pinia, RegleVuePlugin],
      },
    });

    if (element.find('.compoA').exists()) {
      expect(element.find('.compoA').text()).toBe('Hello');
    }

    if (element.find('.compoA').exists()) {
      element.find('.compoA-input').setValue('Boo');
    }

    await element.vm.$nextTick();

    if (element.find('.compoA').exists()) {
      expect(element.find('input').element.value).toBe('Boo');
    }

    if (element.find('.compoA').exists()) {
      expect(element.find('.compoA').text()).toBe('Boo');
    }

    element.vm.handleToggle();
    await nextTick();

    if (element.find('.compoB').exists()) {
      expect(element.find('.compoB').text()).toBe('Nothing');
    }

    element.vm.handleToggle();
    useStore();
    await nextTick();

    if (element.find('.compoA').exists()) {
      expect(element.find('.compoA').text()).toBe('Boo');
    }

    if (element.find('.compoA').exists()) {
      element.find('.compoA-input').setValue('');
    }

    await nextTick();
    await flushPromises();

    if (element.find('.compoA').exists()) {
      expect(element.find('.compoA').text()).toBe('');
    }
  });

  it('should reactivate a lazily cached useRegle instance after remount', async () => {
    const { LazyCompoA, LazyParentCompo } = createLazyCachedValidationComponents('lazy-regle-store', () =>
      useRegle({ name: '' }, { name: { required } })
    );
    const pinia = createPinia();

    setActivePinia(pinia);
    const wrapper = mount(LazyParentCompo, {
      global: {
        plugins: [pinia, RegleVuePlugin],
      },
    });

    let formWrapper = wrapper.getComponent(LazyCompoA);
    shouldBeInvalidField((formWrapper.vm as any).r$.name);

    await formWrapper.get('.compoA-input').setValue('Boo');
    await nextTick();
    await flushPromises();

    shouldBeValidField((formWrapper.vm as any).r$.name, false);
    expect(wrapper.get('.compoA').text()).toBe('Boo');

    (wrapper.vm as any).handleToggle();
    await nextTick();
    (wrapper.vm as any).handleToggle();
    await nextTick();

    formWrapper = wrapper.getComponent(LazyCompoA);
    expect(wrapper.get('.compoA').text()).toBe('Boo');

    await formWrapper.get('.compoA-input').setValue('');
    await nextTick();
    await flushPromises();

    (formWrapper.vm as any).r$.$touch();
    await nextTick();
    await flushPromises();

    shouldBeErrorField((formWrapper.vm as any).r$.name);
    expect(wrapper.get('.compoA').text()).toBe('');
  });

  it('should reactivate a lazily cached useRegleSchema instance after remount', async () => {
    const { LazyCompoA, LazyParentCompo } = createLazyCachedValidationComponents('lazy-schema-store', () => {
      const form = ref({ name: '' });
      const schema = z.object({ name: z.string().min(1) });

      return useRegleSchema(form, inferSchema(form, schema));
    });
    const pinia = createPinia();

    setActivePinia(pinia);
    const wrapper = mount(LazyParentCompo, {
      global: {
        plugins: [pinia, RegleVuePlugin],
      },
    });

    let formWrapper = wrapper.getComponent(LazyCompoA);
    shouldBeInvalidField((formWrapper.vm as any).r$.name);

    await formWrapper.get('.compoA-input').setValue('Boo');
    await nextTick();
    await flushPromises();

    shouldBeValidField((formWrapper.vm as any).r$.name);
    expect(wrapper.get('.compoA').text()).toBe('Boo');

    (wrapper.vm as any).handleToggle();
    await nextTick();
    (wrapper.vm as any).handleToggle();
    await nextTick();

    formWrapper = wrapper.getComponent(LazyCompoA);
    expect(wrapper.get('.compoA').text()).toBe('Boo');

    await formWrapper.get('.compoA-input').setValue('');
    await nextTick();
    await flushPromises();

    (formWrapper.vm as any).r$.$touch();
    await nextTick();
    await flushPromises();

    shouldBeErrorField((formWrapper.vm as any).r$.name);
    expect(wrapper.get('.compoA').text()).toBe('');
  });
});
