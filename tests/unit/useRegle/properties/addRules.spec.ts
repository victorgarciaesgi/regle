import { useRegle } from '@regle/core';
import { email, minLength, required, containsUppercase } from '@regle/rules';
import { nextTick, ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';

describe('addRules', () => {
  it('merges additional field rules with declared rules', async () => {
    const { vm } = createRegleComponent(() => {
      const form = ref({ email: '' });

      return useRegle(form, {
        email: { email },
      });
    });

    expect(vm.r$.email.$rules.email).toBeDefined();
    expect('required' in vm.r$.email.$rules).toBe(false);

    vm.r$.email.addRules({ required });
    await nextTick();

    expect(vm.r$.email.$rules.email).toBeDefined();
    expect('required' in vm.r$.email.$rules).toBe(true);

    vm.r$.email.$touch();
    await nextTick();
    expect(vm.r$.email.$errors).toContain('This field is required');
  });

  it('replaces previously added runtime rules on subsequent calls', async () => {
    const { vm } = createRegleComponent(() => {
      const form = ref({ email: '' });

      return useRegle(form, {
        email: { email },
      });
    });

    vm.r$.email.addRules({ required });
    await nextTick();

    expect(vm.r$.email.$rules.email).toBeDefined();
    expect('required' in vm.r$.email.$rules).toBe(true);

    vm.r$.email.addRules({ minLength: minLength(8) });
    await nextTick();

    expect(vm.r$.email.$rules.email).toBeDefined();
    expect('required' in vm.r$.email.$rules).toBe(false);
    expect('minLength' in vm.r$.email.$rules).toBe(true);
  });

  it('triggers $commit when rules are added', async () => {
    const { vm } = createRegleComponent(() => {
      const form = ref({ name: '' });

      return useRegle(form, {
        name: {},
      });
    });

    vm.r$.name.addRules({ containsUppercase: containsUppercase });

    await nextTick();

    expect(vm.r$.name.$rules.containsUppercase.$metadata.minUppercaseCount).toBe(1);
  });
});
