import { createScopedUseRegle, type ScopedInstancesRecordLike } from '@regle/core';
import { required } from '@regle/rules';
import { mount } from '@vue/test-utils';
import { defineComponent, h, nextTick, reactive, ref } from 'vue';
import { vueVersion } from '../../utils/vueVersion';

describe('useCollectScope - reactivity scope', () => {
  it('should not traverse instances registered in other namespaces', async () => {
    // given
    const store = ref<ScopedInstancesRecordLike>({ '~~global': {} });
    const { useCollectScope } = createScopedUseRegle({ customStore: store });

    let reads = 0;
    const otherState = reactive({ count: 0 });
    const probe = {
      otherState,
      get field() {
        reads++;
        return otherState.count;
      },
    };

    const Collectors = defineComponent({
      setup() {
        useCollectScope('mine');
        useCollectScope(['mine', 'mine-too']);
        useCollectScope();
        return () => h('div');
      },
    });

    const wrapper = mount(Collectors, { attachTo: document.body });
    store.value.other = { probe: probe as any };
    await nextTick();
    reads = 0;

    // when
    for (let i = 0; i < 5; i++) {
      otherState.count++;
      await nextTick();
    }

    // then
    expect(reads).toBe(0);
    wrapper.unmount();
  });

  // Rendering through @vue/test-utils does not react to Vue 3.4 refs (same limitation as useScopedRegle.spec.ts)
  it.runIf(vueVersion === '3.5')(
    'should still collect forms registered and unregistered after the collector',
    async () => {
      // given
      const { useScopedRegle, useCollectScope } = createScopedUseRegle();

      const Form = (namespace: string) =>
        defineComponent({
          setup() {
            const { r$ } = useScopedRegle({ name: '' }, { name: { required } }, { namespace });
            return () => h('input', { value: r$.$value.name });
          },
        });
      const FormA = Form('a');
      const FormB = Form('b');

      const showA = ref(false);
      const showB = ref(false);

      let single: any;
      let multiple: any;

      const wrapper = mount(
        defineComponent({
          setup() {
            single = useCollectScope('a').r$;
            multiple = useCollectScope(['a', 'b']).r$;
            return () => h('div', [showA.value ? h(FormA) : null, showB.value ? h(FormB) : null]);
          },
        }),
        { attachTo: document.body }
      );
      await nextTick();

      expect(single.$instances).toHaveLength(0);
      expect(multiple.$instances).toHaveLength(0);

      // when
      showA.value = true;
      showB.value = true;
      await nextTick();

      // then
      expect(single.$instances).toHaveLength(1);
      expect(multiple.$instances).toHaveLength(2);
      expect(multiple.$value).toStrictEqual([{ name: '' }, { name: '' }]);

      // when
      showA.value = false;
      await nextTick();

      // then
      expect(single.$instances).toHaveLength(0);
      expect(multiple.$instances).toHaveLength(1);

      wrapper.unmount();
    }
  );
});
