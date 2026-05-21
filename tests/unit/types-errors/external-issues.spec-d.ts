import { useRegle, type RegleExternalIssueTree, type RegleFieldIssue } from '@regle/core';
import { required } from '@regle/rules';
import { ref } from 'vue';

describe('external issues types', () => {
  it('should type external issues options and helpers', () => {
    type Form = {
      name: string;
      nested: {
        value: string;
      };
      collection: {
        item: string;
      }[];
    };

    const form = ref<Form>({
      name: '',
      nested: {
        value: '',
      },
      collection: [{ item: '' }],
    });

    const externalIssues = ref<RegleExternalIssueTree<Form>>({
      name: [
        {
          $message: 'Server issue',
          $property: 'name',
          $rule: 'external',
          code: 'SERVER',
        },
      ],
      nested: {
        value: [
          {
            $message: 'Nested issue',
            $property: 'value',
            $rule: 'external',
          },
        ],
      },
      collection: {
        $each: [
          {
            item: [
              {
                $message: 'Item issue',
                $property: 'item',
                $rule: 'external',
              },
            ],
          },
        ],
      },
    });

    const { r$ } = useRegle(
      form,
      {
        name: { required },
        nested: {
          value: { required },
        },
        collection: {
          $each: {
            item: { required },
          },
        },
      },
      { externalIssues }
    );

    expectTypeOf(r$.name.$externalIssues).toEqualTypeOf<RegleFieldIssue[]>();
    r$.$setExternalIssues(externalIssues.value);
    r$.name.$setExternalIssues([
      {
        $message: 'Field issue',
        $property: 'name',
        $rule: 'external',
      },
    ]);
    r$.$clearExternalIssues();
  });
});
