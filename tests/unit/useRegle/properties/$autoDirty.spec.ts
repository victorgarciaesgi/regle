import { nextTick } from 'vue';
import {
  simpleNestedStateWithMixedValidation,
  simpleNestedStateWithMixedValidationAndGlobalConfig,
} from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';
import {
  shouldBeErrorField,
  shouldBeInvalidField,
  shouldBePristineField,
  shouldBeValidField,
} from '../../../utils/validations.utils';

// TODO add test case for dependency change

describe.each([
  ['local modifier', simpleNestedStateWithMixedValidation],
  ['global modifier', simpleNestedStateWithMixedValidationAndGlobalConfig],
])('$autoDirty - %s', (name, rules) => {
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
  ['local modifier', () => simpleNestedStateWithMixedValidation(false)],
  ['global modifier', () => simpleNestedStateWithMixedValidationAndGlobalConfig(false)],
])('$autoDirty -> false - %s', (name, rules) => {
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
    const { vm } = await createRegleComponent(() => simpleNestedStateWithMixedValidation(false));
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

    shouldBePristineField(vm.r$.$fields.email);
    shouldBePristineField(vm.r$.$fields.user.$fields.firstName);
    shouldBePristineField(vm.r$.$fields.user.$fields.lastName);
    shouldBePristineField(vm.r$.$fields.contacts.$each[0]);
  });
});
