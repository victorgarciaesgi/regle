import { useRules } from '@regle/core';
import { required, string } from '@regle/rules';
import { useRegleSchema } from '@regle/schemas';
import { nextTick } from 'vue';
import { shouldBePristineField, shouldBeValidField } from '../../utils/validations.utils';

describe('useRules schema', () => {
  it('should be able to use itself as aschema', async () => {
    const schema = useRules({ username: { required, string } });

    const { r$ } = useRegleSchema({ username: '' }, schema);

    shouldBePristineField(r$.username);

    r$.$value.username = 'foo';
    await nextTick();

    shouldBeValidField(r$.username);
  });
});
