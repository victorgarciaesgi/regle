import { useRegle } from '@regle/core';
import { flushPromises, mount } from '@vue/test-utils';
import { defineComponent, ref } from 'vue';
import { timeout } from '../../../../../tests/utils';
import { applyIf } from '../../helpers/applyIf';
import { required } from '../../validators';

describe('applyIf helper', () => {
  const testComponent = defineComponent({
    setup() {
      const form = ref({
        email: '',
        count: 0,
      });

      const { $errors, validateForm, $regle } = useRegle(form, () => ({
        email: {
          error: applyIf(() => form.value.count === 1, required),
        },
      }));

      return { form, $errors, validateForm, $regle };
    },
  });

  const { vm } = mount(testComponent);

  it('should return empty errors', () => {
    expect(vm.$errors.email).toStrictEqual([]);
  });

  it('should be valid when touching field', async () => {
    vm.$regle.$fields.email.$touch();
    await timeout(0);
    expect(vm.$errors.email).toStrictEqual([]);
    expect(vm.$regle.$error).toBe(false);
  });

  it('should be invalid when touching activating helper', async () => {
    vm.form.count = 1;
    await timeout(0);
    expect(vm.$errors.email).toStrictEqual(['Value is required']);
    expect(vm.$regle.$error).toBe(true);
  });
});
