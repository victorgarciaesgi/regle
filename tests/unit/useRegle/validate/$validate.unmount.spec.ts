import { useRegle } from '@regle/core';
import { required } from '@regle/rules';
import { mount } from '@vue/test-utils';
import { defineComponent, nextTick, onMounted, ref } from 'vue';

describe('$validate while the component unmounts', () => {
  it('should resolve instead of rejecting when the owner unmounts during nextTick (#404)', async () => {
    const results: Promise<unknown>[] = [];

    const Child = defineComponent({
      emits: ['validating'],
      setup(_, { emit }) {
        const { r$ } = useRegle({ name: '' }, { name: { required } });
        onMounted(() => {
          results.push(r$.$validate());
          // Unmount the owner in the same flush, while $validate is awaiting nextTick
          emit('validating');
        });
        return () => null;
      },
    });

    const Parent = defineComponent({
      components: { Child },
      setup() {
        const isLoading = ref(false);
        return { isLoading };
      },
      template: `<Child v-if="!isLoading" @validating="isLoading = true" />`,
    });

    const Root = defineComponent({
      components: { Parent },
      props: { isOpen: Boolean },
      template: `<Parent v-if="isOpen" />`,
    });

    const wrapper = mount(Root, { props: { isOpen: false } });
    // Must be mounted by an update, not the initial app mount
    await wrapper.setProps({ isOpen: true });

    expect(results).toHaveLength(1);
    await expect(results[0]).resolves.toMatchObject({ valid: false });
  });
});
