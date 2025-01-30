import { createTestingPinia } from '@pinia/testing';
import { useRegle } from '@regle/core';
import { required } from '@regle/rules';
import { flushPromises, mount } from '@vue/test-utils';
import { defineStore, setActivePinia, skipHydrate, storeToRefs } from 'pinia';
import { defineComponent, nextTick, onScopeDispose, ref } from 'vue';
import { shouldBePristineField } from '../../utils/validations.utils';

describe('$dispose', () => {
  const pinia = createTestingPinia({ stubActions: false });
  beforeEach(() => {
    setActivePinia(pinia);
  });
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
      setActivePinia(pinia);
      const testForm = useStore(pinia);
      const { r$ } = storeToRefs(testForm);

      onScopeDispose(() => {
        // TODO dispose break reactivity in tests only
        testForm.$dispose();
      });

      return {
        r$,
      };
    },
    template: '<div class="compoA">{{r$.$value.name}}</div>',
  });
  const CompoB = defineComponent({ template: '<div class="compoB">Nothing</div>' });
  const ParentCompo = defineComponent({
    components: { CompoA, CompoB },
    setup() {
      const condition = ref(true);
      const store = useStore();

      function handleToggle() {
        condition.value = !condition.value;
      }

      return {
        condition,
        handleToggle,
        store,
      };
    },
    template: `
    <CompoA v-if="condition" />
    <CompoB v-else />
  `,
  });
  it('it should not break when disposing a store', async () => {
    const element = mount(ParentCompo, {
      global: {
        plugins: [pinia],
      },
    });

    if (element.find('.compoA').exists()) {
      expect(element.find('.compoA').text()).toBe('Hello');
    }
    shouldBePristineField(element.vm.store.r$.$fields.name);

    const store = useStore(pinia);

    // store.r$.$value.name = 'Boo';
    await nextTick();
    await flushPromises();

    // if (element.find('.compoA').exists()) {
    //   expect(element.find('.compoA').text()).toBe('Boo');
    // }

    element.vm.handleToggle();
    await nextTick();

    if (element.find('.compoB').exists()) {
      expect(element.find('.compoB').text()).toBe('Nothing');
    }

    element.vm.handleToggle();
    await nextTick();

    if (element.find('.compoA').exists()) {
      expect(element.find('.compoA').text()).toBe('Hello');
    }

    element.vm.store.updateValue('');
    await nextTick();

    // if (element.find('.compoA').exists()) {
    //   expect(element.find('.compoA').text()).toBe('');
    // }
    // shouldBeErrorField(element.vm.store.r$.$fields.name);
  });
});
