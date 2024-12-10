import { createRule, defineRegleConfig, useRegle } from '@regle/core';
import { withTooltip } from '@regle/rules';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';

function tooltipsRules() {
  const ruleWithOneTooltip = withTooltip(() => false, 'Tooltip');
  const ruleWithMultipleTooltips = withTooltip(() => false, ['Tooltip 1.1', 'Tooltip 1.2']);
  const ruleFunctionWithOneTooltip = withTooltip(
    () => false,
    () => 'Tooltip 2'
  );
  const ruleFunctionWithMultipleTooltip = withTooltip(
    () => false,
    () => ['Tooltip 2.1', 'Tooltip 2.2']
  );

  const createRuleOneTooltip = createRule({ validator: () => false, message: '', tooltip: 'Tooltip 3' });
  const createRuleMultipleTooltip = createRule({
    validator: () => false,
    message: '',
    tooltip: ['Tooltip 3.1', 'Tooltip 3.2', 'Tooltip 3.3'],
  });
  const createRuleFunctionOneTooltip = createRule({ validator: () => false, message: '', tooltip: () => 'Tooltip 4' });
  const createRuleFunctionMultipleTooltip = createRule({
    validator: () => false,
    message: '',
    tooltip: () => ['Tooltip 4.1'],
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

  const allRules = {
    ruleWithOneTooltip,
    ruleWithMultipleTooltips,
    ruleFunctionWithOneTooltip,
    ruleFunctionWithMultipleTooltip,
    createRuleOneTooltip,
    createRuleMultipleTooltip,
    createRuleFunctionOneTooltip,
    createRuleFunctionMultipleTooltip,
  };

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

describe('tooltips', () => {
  it('should report any tooltip format for rules', async () => {
    const { vm } = createRegleComponent(tooltipsRules);

    await vm.$nextTick();

    const expectedTooltips = [
      'Tooltip',
      'Tooltip 1.1',
      'Tooltip 1.2',
      'Tooltip 2',
      'Tooltip 2.1',
      'Tooltip 2.2',
      'Tooltip 3',
      'Tooltip 3.1',
      'Tooltip 3.2',
      'Tooltip 3.3',
      'Tooltip 4',
      'Tooltip 4.1',
    ];

    expect(vm.r$.$fields.email.$tooltips).toStrictEqual(expectedTooltips);
    expect(vm.r$.$fields.user.$fields.firstName.$tooltips).toStrictEqual(expectedTooltips);
    expect(vm.r$.$fields.user.$fields.nested.$fields.child.$tooltips).toStrictEqual(expectedTooltips);
    expect(vm.r$.$fields.user.$fields.nested.$fields.collection.$field.$tooltips).toStrictEqual(expectedTooltips);
    expect(vm.r$.$fields.user.$fields.nested.$fields.collection.$each[0].$fields.name.$tooltips).toStrictEqual(
      expectedTooltips
    );
    expect(vm.r$.$fields.contacts.$each[0].$fields.name.$tooltips).toStrictEqual(expectedTooltips);

    vm.r$.$value.contacts.push({ name: '' });
    await vm.$nextTick();
    vm.r$.$touch();
    await vm.$nextTick();

    expect(vm.r$.$fields.contacts.$each[1].$fields.name.$tooltips).toStrictEqual(expectedTooltips);
  });
});
