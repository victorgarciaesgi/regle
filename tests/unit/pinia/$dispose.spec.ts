import { useRegle } from '@regle/core';
import { required } from '@regle/rules';
import { flushPromises, mount } from '@vue/test-utils';
import { createPinia, defineStore, setActivePinia, skipHydrate, storeToRefs } from 'pinia';
import { defineComponent, nextTick, ref } from 'vue';
import { isVueSuperiorOrEqualTo3dotFive } from '../../../packages/core/src/utils';

describe.runIf(isVueSuperiorOrEqualTo3dotFive)('$dispose', () => {
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
  it('it should not break when disposing a store', async () => {
    const pinia = createPinia();
    setActivePinia(pinia);
    const element = mount(ParentCompo, {
      global: {
        plugins: [pinia],
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
});
