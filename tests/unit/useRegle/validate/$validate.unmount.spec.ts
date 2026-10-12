import { useRegle } from '@regle/core';
import { required } from '@regle/rules';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, onMounted, ref } from 'vue';

describe('$validate while the component unmounts', () => {
  it('should resolve instead of rejecting when the owner unmounts during nextTick (#404)', async () => {
    const results: Promise<unknown>[] = [];

    const Child = defineComponent({
      setup() {
        const { r$ } = useRegle({ name: '' }, { name: { required } });
        onMounted(() => {
          results.push(r$.$validate());
        });
        return () => null;
      },
    });

    const Parent = defineComponent({
      components: { Child },
      setup() {
        const isLoading = ref(false);
        // Parent's onMounted runs after the child's, in the same flush, and unmounts the child
        onMounted(() => {
          isLoading.value = true;
        });
        return { isLoading };
      },
      template: `<Child v-if="!isLoading" />`,
    });

    const Root = defineComponent({
      components: { Parent },
      setup() {
        const open = ref(false);
        return { open };
      },
      template: `<button @click="open = true" /><Parent v-if="open" />`,
    });

    const wrapper = mount(Root);
    // Must be mounted by an update, not the initial app mount
    await wrapper.find('button').trigger('click');
    await nextTick();

    expect(results).toHaveLength(1);
    await expect(results[0]).resolves.toMatchObject({ valid: false });
  });
});
