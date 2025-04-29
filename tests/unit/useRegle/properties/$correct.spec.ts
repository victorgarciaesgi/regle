import { useRegle } from '@regle/core';
import { email, minLength, required, requiredIf } from '@regle/rules';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';

function regleFixture() {
  const condition1 = ref(true);
  const condition2 = ref(false);

  return {
    condition1,
    condition2,
    ...useRegle(
      {
        nested: { name: '', noRules: '', dynamic: '' },
        nested2: { name: '', email: '' },
      },
      {
        nested: {
          name: { required },
          dynamic: { required: requiredIf(condition1), required2: requiredIf(condition2) },
        },
        nested2: { name: { required, minLength: minLength(4) }, email: { email } },
      }
    ),
  };
}

describe('$correct validation property', () => {
  it('should computed the $correct property correctly', async () => {
    const { vm } = createRegleComponent(regleFixture);

    expect(vm.r$.$fields.nested.$correct).toBe(false);
    expect(vm.r$.$fields.nested.$fields.name.$correct).toBe(false);
    expect(vm.r$.$fields.nested.$fields.noRules.$correct).toBe(false);
    expect(vm.r$.$fields.nested.$fields.dynamic.$correct).toBe(false);

    vm.r$.$value.nested.name = 'foo';
    vm.r$.$value.nested.noRules = 'foo';
    vm.r$.$value.nested.dynamic = 'foo';
    await vm.$nextTick();

    expect(vm.r$.$fields.nested.$correct).toBe(true);
    expect(vm.r$.$fields.nested.$fields.name.$correct).toBe(true);
    expect(vm.r$.$fields.nested.$fields.noRules.$correct).toBe(false);
    expect(vm.r$.$fields.nested.$fields.dynamic.$correct).toBe(true);

    vm.r$.$value.nested.name = '';
    vm.r$.$value.nested.noRules = '';
    vm.r$.$value.nested.dynamic = '';

    vm.condition1 = false;
    await vm.$nextTick();

    expect(vm.r$.$fields.nested.$correct).toBe(false);
    expect(vm.r$.$fields.nested.$fields.name.$correct).toBe(false);
    expect(vm.r$.$fields.nested.$fields.noRules.$correct).toBe(false);
    expect(vm.r$.$fields.nested.$fields.dynamic.$correct).toBe(false);

    vm.r$.$value.nested.name = 'foo';
    vm.r$.$value.nested.dynamic = 'foo';
    await vm.$nextTick();

    expect(vm.r$.$fields.nested.$correct).toBe(true);
    expect(vm.r$.$fields.nested.$fields.name.$correct).toBe(true);
    expect(vm.r$.$fields.nested.$fields.noRules.$correct).toBe(false);
    expect(vm.r$.$fields.nested.$fields.dynamic.$correct).toBe(false);

    // Nested 2

    expect(vm.r$.$correct).toBe(false);

    expect(vm.r$.$fields.nested2.$correct).toBe(false);
    expect(vm.r$.$fields.nested2.$fields.name.$correct).toBe(false);
    expect(vm.r$.$fields.nested2.$fields.email.$correct).toBe(false);

    vm.r$.$value.nested2.name = 'ehjeifhzfezf';
    await vm.$nextTick();

    expect(vm.r$.$fields.nested2.$correct).toBe(true);
    expect(vm.r$.$fields.nested2.$fields.name.$correct).toBe(true);
    expect(vm.r$.$fields.nested2.$fields.email.$correct).toBe(false);

    expect(vm.r$.$correct).toBe(true);
  });
});
