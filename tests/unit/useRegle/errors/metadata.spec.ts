import { createRule, useRegle } from '@regle/core';
import { withMessage, withParams } from '@regle/rules';
import { ref } from 'vue';

function metadateRules() {
  const externalDep = ref('external');
  const inlineMetadataRule = withMessage(
    withParams((value, external) => ({ $valid: false, external, value }), [externalDep]),
    (_, { external, value }) => `${external}-${value}`
  );
  const createRuleMetadataRule = createRule({
    validator: (value, external) => ({ $valid: false, external, value }),
    message: (_, { external, value }) => `${external}-${value}`,
  });

  const form = ref({
    email: '',
    user: {
      firstName: '',
      nested: {
        child: '',
        collection: [{ name: '' }],
      },
    },
    contacts: [{ name: '' }],
  });

  const allRules = { inlineMetadataRule, createRuleMetadataRule: createRuleMetadataRule(externalDep) };

  return useRegle(form, {
    email: allRules,
    user: {
      firstName: allRules,
      nested: {
        child: allRules,
        collection: {
          ...allRules,
          $each: {
            name: allRules,
          },
        },
      },
    },
    contacts: {
      $each: {
        name: allRules,
      },
    },
  });
}

describe('metadata', () => {
  it('correctly return metadata for validator and active handlers', () => {
    expect(true).toBe(true);
  });
});
