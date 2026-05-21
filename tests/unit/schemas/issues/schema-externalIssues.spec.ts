import { useRegleSchema } from '@regle/schemas';
import { z } from 'zod/v4';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import type { RegleExternalSchemaIssueTree, RegleFieldIssue } from '@regle/core';

function issue(message: string, property: string, code: string): RegleFieldIssue & { code: string } {
  return {
    $message: message,
    $property: property,
    $rule: 'external',
    code,
  };
}

describe('schema external issues', () => {
  it('should expose structured external issues with useRegleSchema', async () => {
    function schemaExternalIssues() {
      const form = ref({
        name: 'foo',
        collection: [{ item: 'foo' }, { item: 'foo' }],
      });
      const schema = z.object({
        name: z.string().min(1),
        collection: z.array(
          z.object({
            item: z.string().min(1),
          })
        ),
      });
      const externalIssues = ref<RegleExternalSchemaIssueTree<typeof form.value>>({});

      return {
        externalIssues,
        ...useRegleSchema(form, schema, { externalIssues, clearExternalErrorsOnChange: false }),
      };
    }

    const { vm } = createRegleComponent(schemaExternalIssues);

    vm.r$.$touch();
    vm.externalIssues = {
      name: [issue('Server Name', 'name', 'NAME')],
      collection: {
        $each: [{}, { item: [issue('Server Item', 'item', 'ITEM')] }],
      },
    };

    await vm.$nextTick();

    expect(vm.r$.name.$errors).toStrictEqual(['Server Name']);
    expect(vm.r$.name.$issues).toStrictEqual([issue('Server Name', 'name', 'NAME')]);
    expect(vm.r$.collection.$each[1].item.$errors).toStrictEqual(['Server Item']);
    expect(vm.r$.collection.$each[1].item.$issues).toStrictEqual([issue('Server Item', 'item', 'ITEM')]);

    const { valid } = await vm.r$.$validate();
    expect(valid).toBe(true);
  });
});
