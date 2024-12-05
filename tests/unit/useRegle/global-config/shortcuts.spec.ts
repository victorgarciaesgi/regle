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
      collections: {
        $haveLeastOneValid: (collec) => collec.$each.some((field) => field.$valid),
      },
      nested: {
        $haveLeastOneValid: (nest) => Object.values(nest.$fields).some((field) => field.$valid),
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

    shouldBeInvalidField(vm.r$.$fields.level0);
    shouldBePristineField(vm.r$.$fields.level1.$fields.level2.$fields.child);
    shouldBeInvalidField(vm.r$.$fields.collection.$each[0].$fields.name);

    expect(vm.r$.$fields.level0.$isRequired).toBe(true);
    expect(vm.r$.$fields.level1.$fields.level2.$fields.child.$isRequired).toBe(false);
    expect(vm.r$.$fields.collection.$each[0].$fields.name.$isRequired).toBe(true);

    expect(vm.r$.$fields.level1.$fields.level2.$haveLeastOneValid).toBe(false);
    expect(vm.r$.$fields.collection.$haveLeastOneValid).toBe(false);

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

    expect(vm.r$.$fields.level0.$isRequired).toBe(true);
    expect(vm.r$.$fields.level1.$fields.level2.$fields.child.$isRequired).toBe(false);
    expect(vm.r$.$fields.collection.$each[0].$fields.name.$isRequired).toBe(true);

    // `$valid` is true is set only if the rule is active
    expect(vm.r$.$fields.level1.$fields.level2.$haveLeastOneValid).toBe(false);
    expect(vm.r$.$fields.collection.$haveLeastOneValid).toBe(true);

    vm.condition = false;
    await vm.$nextTick();

    expect(vm.r$.$fields.level0.$isRequired).toBe(false);
    expect(vm.r$.$fields.level1.$fields.level2.$fields.child.$isRequired).toBe(true);
    expect(vm.r$.$fields.collection.$each[0].$fields.name.$isRequired).toBe(false);

    expect(vm.r$.$fields.level1.$fields.level2.$haveLeastOneValid).toBe(true);
    expect(vm.r$.$fields.collection.$haveLeastOneValid).toBe(false);
  });
});
