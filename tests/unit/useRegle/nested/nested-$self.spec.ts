import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { useRegle } from '@regle/core';
import { required, email, atLeastOne } from '@regle/rules';

describe('object validation with $self', () => {
  it('should validate the object itself if only has $self rules', async () => {
    function selfValidation() {
      const state = ref<{ email: string; user?: { firstName: string; lastName: string } }>({ email: '' });
      return useRegle(state, {
        email: { required, email },
        user: { $self: { required, atLeastOne } },
      });
    }
    const { vm } = createRegleComponent(selfValidation);

    expect(vm.r$.user.$invalid).toBe(true);
    expect(vm.r$.user.$self.$dirty).toBe(false);
    expect(vm.r$.user.$error).toBe(false);
    expect(vm.r$.user.$correct).toBe(false);
    expect(vm.r$.user.$self.$invalid).toBe(true);
    expect(vm.r$.user.$self.$correct).toBe(false);

    vm.r$.user.$value = {} as any;
    await vm.$nextTick();

    expect(vm.r$.user.$invalid).toBe(true);
    expect(vm.r$.user.$self.$dirty).toBe(true);
    expect(vm.r$.user.$error).toBe(true);
    expect(vm.r$.user.$correct).toBe(false);
    expect(vm.r$.user.$self.$invalid).toBe(true);
    expect(vm.r$.user.$self.$correct).toBe(false);

    const { valid } = await vm.r$.$validate();
    expect(valid).toBe(false);

    vm.r$.user.$value = { firstName: 'John', lastName: 'Doe' };
    await vm.$nextTick();
    expect(vm.r$.user.$invalid).toBe(false);
    expect(vm.r$.user.$correct).toBe(true);
  });

  it('should validate the object itself if has $self rules and other rules', async () => {
    function selfValidation() {
      const state = ref<{ email: string; user?: { firstName: string; lastName: string } }>({ email: '' });
      return useRegle(state, {
        email: { required, email },
        user: { $self: { required, atLeastOne }, firstName: { required } },
      });
    }
    const { vm } = createRegleComponent(selfValidation);

    expect(vm.r$.user.$invalid).toBe(true);
    expect(vm.r$.user.$correct).toBe(false);
    expect(vm.r$.user.$self.$invalid).toBe(true);
    expect(vm.r$.user.$self.$correct).toBe(false);

    vm.r$.user.$value = { firstName: '', lastName: 'Doe' };
    await vm.$nextTick();
    expect(vm.r$.user.$invalid).toBe(true);
    expect(vm.r$.user.$correct).toBe(false);
    expect(vm.r$.user.$self.$invalid).toBe(false);
    expect(vm.r$.user.$self.$correct).toBe(true);

    vm.r$.user.$value = { firstName: 'John', lastName: 'Doe' };
    await vm.$nextTick();
    expect(vm.r$.user.$invalid).toBe(false);
    expect(vm.r$.user.$correct).toBe(true);

    // Reset and retry
    vm.r$.$reset({ toInitialState: true });
    await vm.$nextTick();

    expect(vm.r$.user.$invalid).toBe(true);
    expect(vm.r$.user.$correct).toBe(false);
    expect(vm.r$.user.$self.$invalid).toBe(true);
    expect(vm.r$.user.$self.$correct).toBe(false);

    vm.r$.user.$value = { firstName: '', lastName: 'Doe' };
    await vm.$nextTick();
    expect(vm.r$.user.$invalid).toBe(true);
    expect(vm.r$.user.$correct).toBe(false);
    expect(vm.r$.user.$self.$invalid).toBe(false);
    expect(vm.r$.user.$self.$correct).toBe(true);

    vm.r$.user.$value = { firstName: 'John', lastName: 'Doe' };
    await vm.$nextTick();
    expect(vm.r$.user.$invalid).toBe(false);
    expect(vm.r$.user.$correct).toBe(true);
  });
});
