import { defineRegleConfig } from '@regle/core';
import { requiredIf, requiredUnless } from '@regle/rules';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeInvalidField, shouldBePristineField } from '../../../utils/validations.utils';

function nestedRefObjectValidation() {
  const { useRegle } = defineRegleConfig({
    shortcuts: {
      fields: {
        $isRequired: (field) => field.$rules.required?.$active ?? false,
      },
      nested: {
        $haveLeastOneCorrect: (nest) => Object.values(nest.$fields).some((field) => field.$correct),
      },
      collections: {
        $haveLeastOneInvalid: (collec) => collec.$each.some((field) => field.$invalid),
      },
    },
  });

  const condition = ref(true);
  const form = ref({
    level0: '',
    level1: {
      level2: {
        child: '',
      },
    },
    collection: [{ name: '' }],
  });

  return {
    condition,
    ...useRegle(form, {
      level0: { required: requiredIf(condition) },
      level1: {
        level2: {
          child: { required: requiredUnless(condition) },
        },
      },
      collection: {
        $each: {
          name: { required: requiredIf(condition) },
        },
      },
    }),
  };
}

describe('defineRegleConfig rules', () => {
  it('should display global errors instead of rule-defined error', async () => {
    const { vm } = createRegleComponent(nestedRefObjectValidation);

    shouldBeInvalidField(vm.r$.level0);
    shouldBePristineField(vm.r$.level1.level2.child);
    shouldBeInvalidField(vm.r$.collection.$each[0].name);

    expect(vm.r$.level0.$isRequired).toBe(true);
    expect(vm.r$.level1.level2.child.$isRequired).toBe(false);
    expect(vm.r$.collection.$each[0].name.$isRequired).toBe(true);

    expect(vm.r$.level1.level2.$haveLeastOneCorrect).toBe(false);
    expect(vm.r$.collection.$haveLeastOneInvalid).toBe(true);

    vm.r$.$value = {
      level0: 'foo',
      level1: {
        level2: {
          child: 'foo',
        },
      },
      collection: [{ name: 'foo' }, { name: '' }],
    };

    await vm.$nextTick();

    expect(vm.r$.level0.$isRequired).toBe(true);
    expect(vm.r$.level1.level2.child.$isRequired).toBe(false);
    expect(vm.r$.collection.$each[0].name.$isRequired).toBe(true);

    // `$correct` is true is set only if the rule is active
    expect(vm.r$.level1.level2.$haveLeastOneCorrect).toBe(false);
    expect(vm.r$.collection.$haveLeastOneInvalid).toBe(true);

    vm.condition = false;
    await vm.$nextTick();

    expect(vm.r$.level0.$isRequired).toBe(false);
    expect(vm.r$.level1.level2.child.$isRequired).toBe(true);
    expect(vm.r$.collection.$each[0].name.$isRequired).toBe(false);

    expect(vm.r$.level1.level2.$haveLeastOneCorrect).toBe(true);
    expect(vm.r$.collection.$correct).toBe(true);
    expect(vm.r$.collection.$each[0].name.$correct).toBe(false);
    expect(vm.r$.collection.$haveLeastOneInvalid).toBe(false);
  });
});
