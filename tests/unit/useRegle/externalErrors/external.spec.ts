import { useRegle, type RegleExternalErrorTree } from '@regle/core';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBePristineField } from '../../../utils/validations.utils';

describe('external errors', () => {
  function nestedExternalErrorsOnly() {
    interface Form {
      nested: { name1: { name2: '' } };
      collection: {
        item: string;
      }[];
    }

    const form = ref<Form>({
      nested: { name1: { name2: '' } },
      collection: [{ item: '' }, { item: '' }],
    });

    const externalErrors = ref<RegleExternalErrorTree<Form>>({});

    return useRegle(form, {}, { externalErrors });
  }

  it('should behave correctly when no client rule is present', async () => {
    const { vm } = createRegleComponent(nestedExternalErrorsOnly);

    // shouldBePristineField(vm.r$.$fields.nested?.$fields.name1?.$fields.name2);
  });
});
