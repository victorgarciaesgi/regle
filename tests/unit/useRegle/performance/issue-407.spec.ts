import { mount } from '@vue/test-utils';
import { useRegle } from '@regle/core';
import { email, required } from '@regle/rules';
import { defineComponent, nextTick, ref } from 'vue';

// With the Vue 3.4 alias, the built packages still run on Vue 3.5, so component scope disposal can't be observed.
describe.skipIf(process.env.VUE_VERSION === '3.4')('issue #407 - r$ access after the owning scope stops', () => {
  it('should not throw when interacting with a field during a leave transition', async () => {
    const errors: unknown[] = [];

    const EmailField = defineComponent({
      setup() {
        const { r$ } = useRegle({ email: '' }, { email: { required, email } });
        return { r$ };
      },
      template: `<input v-model="r$.$value.email" @blur="r$.email.$touch()" />`,
    });

    const Parent = defineComponent({
      components: { EmailField },
      setup() {
        const show = ref(true);
        return { show };
      },
      template: `<div><Transition name="fade" :duration="1000"><EmailField v-if="show" /></Transition></div>`,
    });

    const wrapper = mount(Parent, {
      attachTo: document.body,
      global: {
        stubs: { transition: false },
        config: { errorHandler: (err) => errors.push(err) },
      },
    });

    wrapper.vm.show = false;
    await nextTick();

    // The component is unmounted (scope stopped) but the leave transition keeps the input in the DOM
    const input = wrapper.find('input');
    expect(input.exists()).toBe(true);

    await input.setValue('foo@bar.com');
    await input.trigger('blur');

    expect(errors).toEqual([]);
    wrapper.unmount();
  });

  it('should not throw when r$ is used after unmount', async () => {
    let captured: any;
    const Comp = defineComponent({
      setup() {
        const { r$ } = useRegle(
          { email: '', list: [{ name: '' }] },
          { email: { required }, list: { $each: { name: { required } } } }
        );
        captured = r$;
        return { r$ };
      },
      template: `<div />`,
    });

    const wrapper = mount(Comp);
    wrapper.unmount();

    expect(() => {
      captured.email.$touch();
      captured.$reset();
      captured.list.$each[0].name.$touch();
      captured.$value.email = 'a';
      captured.email.$value = 'b';
    }).not.toThrow();
    expect(await captured.$validate()).toBeUndefined();
  });
});
