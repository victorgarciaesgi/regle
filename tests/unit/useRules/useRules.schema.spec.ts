import { useRules } from '@regle/core';
import { required, string } from '@regle/rules';
import { useRegleSchema } from '@regle/schemas';
import { nextTick } from 'vue';
import { shouldBePristineField, shouldBeValidField } from '../../utils/validations.utils';
import { createRegleComponent } from '../../utils/test.utils';

describe('useRules schema', () => {
  it('should be able to use itself as aschema', async () => {
    function useRulesSchema() {
      const schema = useRules({ username: { required, string } });

      const { r$ } = useRegleSchema({ username: '' }, schema);
      return { r$ };
    }

    const { vm } = createRegleComponent(useRulesSchema);

    shouldBePristineField(vm.r$.username);

    vm.r$.$value.username = 'foo';
    await nextTick();

    shouldBeValidField(vm.r$.username);
  });
});
