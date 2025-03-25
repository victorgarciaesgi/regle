import { createRule, useRegle, type Maybe } from '@regle/core';
import { withMessage, withParams, withTooltip } from '@regle/rules';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';

function metadateRules() {
  const externalDep = ref('external');

  const inlineMetadataRule = withTooltip(
    withMessage(
      withParams(
        (value: Maybe<string | any[]>, external) => ({ $valid: false, metaExternal: external, value }),
        [externalDep]
      ),
      ({ metaExternal, value, $params: [external] }) => `${metaExternal}-${external}-${value?.length}`
    ),
    ({ metaExternal, value, $params: [external] }) => `${metaExternal}-${external}-${value?.length}`
  );
  const createRuleMetadataRule = createRule({
    validator: (value: Maybe<string | any[]>, external) => ({ $valid: false, metaExternal: external, value }),
    message: ({ metaExternal, value, $params: [external] }) => `${metaExternal}-${external}-${value?.length}`,
    tooltip: ({ metaExternal, value, $params: [external] }) => `${metaExternal}-${external}-${value?.length}`,
    active: ({ $params: [external] }) => external === 'external',
  });

  const form = ref({
    email: 'a',
    user: {
      firstName: 'a',
      nested: {
        child: 'a',
        collection: [{ name: 'a' }],
      },
    },
    contacts: [{ name: 'a' }],
  });

  const allRules = { inlineMetadataRule, createRuleMetadataRule: createRuleMetadataRule(externalDep) };

  return {
    externalDep,
    ...useRegle(form, {
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
    }),
  };
}

describe('metadata', () => {
  it('correctly return metadata for validator and active handlers', async () => {
    const { vm } = createRegleComponent(metadateRules);

    vm.r$.$touch();
    await vm.$nextTick();

    const expectedMessage = ['external-external-1', 'external-external-1'];

    expect(vm.r$.$fields.email.$errors).toStrictEqual(expectedMessage);
    expect(vm.r$.$fields.user.$fields.firstName.$errors).toStrictEqual(expectedMessage);
    expect(vm.r$.$fields.user.$fields.nested.$fields.child.$errors).toStrictEqual(expectedMessage);
    expect(vm.r$.$fields.user.$fields.nested.$fields.collection.$self.$errors).toStrictEqual(expectedMessage);
    expect(vm.r$.$fields.user.$fields.nested.$fields.collection.$each[0].$fields.name.$errors).toStrictEqual(
      expectedMessage
    );
    expect(vm.r$.$fields.contacts.$each[0].$fields.name.$errors).toStrictEqual(expectedMessage);

    // Tooltips
    expect(vm.r$.$fields.email.$tooltips).toStrictEqual(expectedMessage);
    expect(vm.r$.$fields.user.$fields.firstName.$tooltips).toStrictEqual(expectedMessage);
    expect(vm.r$.$fields.user.$fields.nested.$fields.child.$tooltips).toStrictEqual(expectedMessage);
    expect(vm.r$.$fields.user.$fields.nested.$fields.collection.$self.$tooltips).toStrictEqual(expectedMessage);
    expect(vm.r$.$fields.user.$fields.nested.$fields.collection.$each[0].$fields.name.$tooltips).toStrictEqual(
      expectedMessage
    );
    expect(vm.r$.$fields.contacts.$each[0].$fields.name.$tooltips).toStrictEqual(expectedMessage);

    // Active
    expect(vm.r$.$fields.contacts.$each[0].$fields.name.$rules.createRuleMetadataRule.$active).toBe(true);
    expect(vm.r$.$fields.email.$rules.createRuleMetadataRule.$active).toBe(true);
    expect(vm.r$.$fields.user.$fields.firstName.$rules.createRuleMetadataRule.$active).toBe(true);
    expect(vm.r$.$fields.user.$fields.nested.$fields.child.$rules.createRuleMetadataRule.$active).toBe(true);
    expect(vm.r$.$fields.user.$fields.nested.$fields.collection.$self.$rules.createRuleMetadataRule.$active).toBe(true);
    expect(
      vm.r$.$fields.user.$fields.nested.$fields.collection.$each[0].$fields.name.$rules.createRuleMetadataRule.$active
    ).toBe(true);
    expect(vm.r$.$fields.contacts.$each[0].$fields.name.$rules.createRuleMetadataRule.$active).toBe(true);

    // Change value
    vm.externalDep = 'new';
    await vm.$nextTick();

    const expectedMessage2 = ['new-new-1', 'new-new-1'];

    expect(vm.r$.$fields.email.$errors).toStrictEqual(expectedMessage2);
    expect(vm.r$.$fields.user.$fields.firstName.$errors).toStrictEqual(expectedMessage2);
    expect(vm.r$.$fields.user.$fields.nested.$fields.child.$errors).toStrictEqual(expectedMessage2);
    expect(vm.r$.$fields.user.$fields.nested.$fields.collection.$self.$errors).toStrictEqual(expectedMessage2);
    expect(vm.r$.$fields.user.$fields.nested.$fields.collection.$each[0].$fields.name.$errors).toStrictEqual(
      expectedMessage2
    );
    expect(vm.r$.$fields.contacts.$each[0].$fields.name.$errors).toStrictEqual(expectedMessage2);

    // Tooltips
    expect(vm.r$.$fields.email.$tooltips).toStrictEqual(expectedMessage2);
    expect(vm.r$.$fields.user.$fields.firstName.$tooltips).toStrictEqual(expectedMessage2);
    expect(vm.r$.$fields.user.$fields.nested.$fields.child.$tooltips).toStrictEqual(expectedMessage2);
    expect(vm.r$.$fields.user.$fields.nested.$fields.collection.$self.$tooltips).toStrictEqual(expectedMessage2);
    expect(vm.r$.$fields.user.$fields.nested.$fields.collection.$each[0].$fields.name.$tooltips).toStrictEqual(
      expectedMessage2
    );
    expect(vm.r$.$fields.contacts.$each[0].$fields.name.$tooltips).toStrictEqual(expectedMessage2);

    // Active
    expect(vm.r$.$fields.contacts.$each[0].$fields.name.$rules.createRuleMetadataRule.$active).toBe(false);
    expect(vm.r$.$fields.email.$rules.createRuleMetadataRule.$active).toBe(false);
    expect(vm.r$.$fields.user.$fields.firstName.$rules.createRuleMetadataRule.$active).toBe(false);
    expect(vm.r$.$fields.user.$fields.nested.$fields.child.$rules.createRuleMetadataRule.$active).toBe(false);
    expect(vm.r$.$fields.user.$fields.nested.$fields.collection.$self.$rules.createRuleMetadataRule.$active).toBe(
      false
    );
    expect(
      vm.r$.$fields.user.$fields.nested.$fields.collection.$each[0].$fields.name.$rules.createRuleMetadataRule.$active
    ).toBe(false);
    expect(vm.r$.$fields.contacts.$each[0].$fields.name.$rules.createRuleMetadataRule.$active).toBe(false);
  });
});
