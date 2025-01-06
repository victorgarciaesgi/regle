import { useRegle } from '@regle/core';
import { required } from '@regle/rules';
import { mount } from '@vue/test-utils';
import { createPinia, defineStore, setActivePinia, skipHydrate } from 'pinia';
import { defineComponent, nextTick, ref } from 'vue';
import { shouldBeErrorField } from '../../utils/validations.utils';

describe('$dispose', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });
  const useStore = defineStore('store', () => {
    const { r$ } = useRegle(
      { name: 'Hello', nested: { child: '' }, collection: [{ name: '' }] },
      { name: { required: required } }
    );

    return {
      r$: skipHydrate(r$),
    };
  });

  const CompoA = defineComponent({
    setup() {
      const testForm = useStore();
      testForm.r$.$reset();
      return {
        testForm,
      };
    },
    template: '<div class="compoA">{{testForm.r$.$value.name}}</div>',
  });
  const CompoB = defineComponent({ template: '<div class="compoB">Nothing</div>' });
  const ParentCompo = defineComponent({
    components: { CompoA, CompoB },
    setup() {
      const condition = ref(true);
      const store = useStore();

      function handleToggle() {
        if (!condition.value) {
          store.$dispose();
        }
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
    const element = mount(ParentCompo);

    expect(element.find('.compoA').text()).toBe('Hello');

    element.vm.condition = false;
    await nextTick();

    expect(element.find('.compoB')?.text()).toBe('Nothing');

    element.vm.condition = true;
    await nextTick();

    expect(element.find('.compoA').text()).toBe('Hello');

    element.vm.store.r$.$value.name = '';
    await nextTick();
    shouldBeErrorField(element.vm.store.r$.$fields.name);
  });
});
