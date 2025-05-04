import { nextTick, ref } from 'vue';
import {
  simpleNestedStateWithMixedValidation,
  simpleNestedStateWithMixedValidationAndGlobalConfig,
} from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
import {
  shouldBeErrorField,
  shouldBeInvalidField,
  shouldBePristineField,
  shouldBeUnRuledCorrectField,
  shouldBeValidField,
} from '../../../utils/validations.utils';
import { useRegle } from '@regle/core';
import { required, withParams } from '@regle/rules';

describe.each([
  ['local modifier', () => simpleNestedStateWithMixedValidation()],
  ['global modifier', () => simpleNestedStateWithMixedValidationAndGlobalConfig()],
])('$silent -> false - %s', (name, rules) => {
  it('should update the $dirty state to true when value changes', async () => {
    const { vm } = await createRegleComponent(rules);
    shouldBeInvalidField(vm.r$.$fields.email);
    shouldBeInvalidField(vm.r$.$fields.user.$fields.firstName);
    shouldBeInvalidField(vm.r$.$fields.user.$fields.lastName);
    shouldBeInvalidField(vm.r$.$fields.contacts.$each[0]);

    vm.r$.$value.email = 'foo';
    await nextTick();
    shouldBeErrorField(vm.r$.$fields.email);

    vm.r$.$value.email = 'foo@gmail.com';
    await nextTick();
    shouldBeValidField(vm.r$.$fields.email);
  });

  it('should update the `$dirty` state to `true`, even after `$reset`', async () => {
    const { vm } = await createRegleComponent(rules);

    vm.r$.$value.email = 'foo';
    await nextTick();
    shouldBeErrorField(vm.r$.$fields.email);

    vm.r$.$reset();
    expect(vm.r$.$fields.email.$dirty).toBe(false);

    vm.r$.$value.email = 'bar';
    await nextTick();
    shouldBeErrorField(vm.r$.$fields.email);
  });
});

describe.each([
  ['local modifier', () => simpleNestedStateWithMixedValidation({ silent: true })],
  ['global modifier', () => simpleNestedStateWithMixedValidationAndGlobalConfig({ silent: true })],
])('$silent -> true - %s', (name, rules) => {
  beforeAll(() => {
    vi.useFakeTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });
  it('should not update the $dirty state to true when value changes, but when calling $validate', async () => {
    const { vm } = await createRegleComponent(rules);
    shouldBePristineField(vm.r$.$fields.email);
    shouldBePristineField(vm.r$.$fields.user.$fields.firstName);
    shouldBePristineField(vm.r$.$fields.user.$fields.lastName);
    shouldBePristineField(vm.r$.$fields.contacts.$each[0]);

    vm.r$.$value.email = 'foo';
    await nextTick();
    shouldBePristineField(vm.r$.$fields.email);

    await Promise.all([vm.r$.$validate(), vi.advanceTimersByTimeAsync(200), vm.$nextTick]);

    shouldBeErrorField(vm.r$.$fields.email);
    shouldBeErrorField(vm.r$.$fields.user.$fields.firstName);
    shouldBeErrorField(vm.r$.$fields.user.$fields.lastName);
    shouldBeErrorField(vm.r$.$fields.contacts.$each[0]);
  });

  it('should update the $dirty state when calling $touch', async () => {
    const { vm } = await createRegleComponent(rules);
    shouldBePristineField(vm.r$.$fields.email);
    shouldBePristineField(vm.r$.$fields.user.$fields.firstName);
    shouldBePristineField(vm.r$.$fields.user.$fields.lastName);
    shouldBePristineField(vm.r$.$fields.contacts.$each[0]);

    vm.r$.$value.email = 'foo';
    await nextTick();
    shouldBePristineField(vm.r$.$fields.email);

    vm.r$.$touch();
    await nextTick();

    shouldBeErrorField(vm.r$.$fields.email);
    shouldBeErrorField(vm.r$.$fields.user.$fields.firstName);
    shouldBeErrorField(vm.r$.$fields.user.$fields.lastName);
    shouldBeErrorField(vm.r$.$fields.contacts.$each[0]);
  });

  it('should update the `$dirty` state to `true`, even after `$reset`', async () => {
    const { vm } = await createRegleComponent(() => simpleNestedStateWithMixedValidation({ silent: true }));
    shouldBePristineField(vm.r$.$fields.email);
    shouldBePristineField(vm.r$.$fields.user.$fields.firstName);
    shouldBePristineField(vm.r$.$fields.user.$fields.lastName);
    shouldBePristineField(vm.r$.$fields.contacts.$each[0]);

    vm.r$.$value.email = 'foo';
    await nextTick();
    shouldBePristineField(vm.r$.$fields.email);

    vm.r$.$touch();
    await nextTick();

    shouldBeErrorField(vm.r$.$fields.email);
    shouldBeErrorField(vm.r$.$fields.user.$fields.firstName);
    shouldBeErrorField(vm.r$.$fields.user.$fields.lastName);
    shouldBeErrorField(vm.r$.$fields.contacts.$each[0]);

    vm.r$.$reset();

    shouldBeInvalidField(vm.r$.$fields.email);
    shouldBeInvalidField(vm.r$.$fields.user.$fields.firstName);
    shouldBeInvalidField(vm.r$.$fields.user.$fields.lastName);
    shouldBeInvalidField(vm.r$.$fields.contacts.$each[0]);
  });

  it('should not run validators with computed rules`', async () => {
    const { vm } = await createRegleComponent(() => simpleNestedStateWithMixedValidation({ silent: true }));
    shouldBePristineField(vm.r$.$fields.email);
    shouldBePristineField(vm.r$.$fields.user.$fields.firstName);
    shouldBePristineField(vm.r$.$fields.user.$fields.lastName);
    shouldBePristineField(vm.r$.$fields.contacts.$each[0]);

    vm.r$.$touch();
    await nextTick();

    shouldBeErrorField(vm.r$.$fields.email);
    shouldBeErrorField(vm.r$.$fields.user.$fields.firstName);
    shouldBeErrorField(vm.r$.$fields.user.$fields.lastName);
    shouldBeErrorField(vm.r$.$fields.contacts.$each[0]);

    vm.condition = false;
    vm.r$.$value.user.firstName = 'foo';
    vm.r$.$value.user.lastName = 'bar';
    vm.r$.$value.contacts[0].name = 'bar';

    await nextTick();

    shouldBeUnRuledCorrectField(vm.r$.$fields.email);
    shouldBeErrorField(vm.r$.$fields.user.$fields.firstName);
    shouldBeErrorField(vm.r$.$fields.user.$fields.lastName);
    shouldBeErrorField(vm.r$.$fields.contacts.$each[0]);

    vm.r$.$touch();

    shouldBeUnRuledCorrectField(vm.r$.$fields.email);
    shouldBeValidField(vm.r$.$fields.user.$fields.firstName);
    shouldBeValidField(vm.r$.$fields.user.$fields.lastName);
    shouldBeValidField(vm.r$.$fields.contacts.$each[0]);
  });

  it('should not re-run validators when a dependency changes`', async () => {
    function simpleDependencyCase() {
      const form = ref({ password: '', confirm: '' });

      return useRegle(
        form,
        {
          password: { required },
          confirm: { same: withParams((value, pass) => value === pass, [() => form.value.password]) },
        },
        {
          silent: true,
        }
      );
    }
    const { vm } = await createRegleComponent(simpleDependencyCase);

    shouldBePristineField(vm.r$.$fields.password);
    shouldBePristineField(vm.r$.$fields.confirm);

    vm.r$.$value.confirm = 'hello';
    vm.r$.$value.password = 'foo';
    await vm.$nextTick();

    shouldBePristineField(vm.r$.$fields.password);
    shouldBePristineField(vm.r$.$fields.confirm);

    await vm.r$.$validate();
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.password);
    shouldBeErrorField(vm.r$.$fields.confirm);

    vm.r$.$value.password = 'hello';
    await vm.$nextTick();

    shouldBeErrorField(vm.r$.$fields.confirm);

    await vm.r$.$validate();

    shouldBeValidField(vm.r$.$fields.confirm);
  });
});

describe('$silent default', () => {
  function defaultDataRegle() {
    return useRegle({} as { firstName?: string }, {}, { silent: true });
  }

  it('should correctly define new $fields from data when silent is true', async () => {
    const { vm } = createRegleComponent(defaultDataRegle);

    expect(vm.r$.$fields).toStrictEqual({});

    vm.r$.$value = { firstName: 'foo' };
    await vm.$nextTick();

    shouldBePristineField(vm.r$.$fields.firstName);
  });
});
