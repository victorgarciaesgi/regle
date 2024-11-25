import {
  simpleNestedStateWithComputedValidation,
  simpleNestedStateWithMixedValidation,
} from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';

describe('.$touch', () => {
  it('should update the `$dirty` state to `true`, on used property', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

    expect(vm.r$.$fields.email.$dirty).toBe(false);
    expect(vm.r$.$fields.user.$dirty).toBe(false);
    expect(vm.r$.$fields.user.$fields.firstName.$dirty).toBe(false);
    expect(vm.r$.$fields.user.$fields.lastName.$dirty).toBe(false);
    expect(vm.r$.$fields.contacts.$dirty).toBe(false);

    vm.r$.$fields.email.$touch();
    vm.r$.$fields.user.$fields.lastName.$touch();

    await vm.$nextTick();

    expect(vm.r$.$fields.email.$dirty).toBe(true);
    expect(vm.r$.$fields.user.$dirty).toBe(false);
    expect(vm.r$.$fields.user.$anyDirty).toBe(true);
    expect(vm.r$.$fields.user.$fields.firstName.$dirty).toBe(false);
    expect(vm.r$.$fields.user.$fields.lastName.$dirty).toBe(true);
    expect(vm.r$.$fields.contacts.$dirty).toBe(false);

    vm.r$.$fields.user.$fields.firstName.$touch();

    await vm.$nextTick();

    expect(vm.r$.$fields.user.$dirty).toBe(true);
  });

  it('should update the `$dirty` state to `true` on all nested properties', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

    expect(vm.r$.$fields.user.$dirty).toBe(false);
    expect(vm.r$.$fields.user.$fields.firstName.$dirty).toBe(false);
    expect(vm.r$.$fields.user.$fields.lastName.$dirty).toBe(false);

    vm.r$.$fields.user.$touch();

    await vm.$nextTick();

    expect(vm.r$.$fields.user.$anyDirty).toBe(true);
    expect(vm.r$.$fields.user.$fields.firstName.$dirty).toBe(true);
    expect(vm.r$.$fields.user.$fields.lastName.$dirty).toBe(true);
  });

  it('should not update the `$dirty` state on the property it wasnt used on', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

    expect(vm.r$.$fields.email.$invalid).toBe(true);
    expect(vm.r$.$fields.email.$error).toBe(false);
    expect(vm.r$.$fields.email.$valid).toBe(false);

    vm.r$.$fields.email.$touch();

    await vm.$nextTick();

    expect(vm.r$.$fields.email.$error).toBe(true);
  });

  it('should update the `$dirty` state to `true` on all properties, when used on top level node', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

    vm.r$.$touch();

    await vm.$nextTick();

    expect(vm.r$.$fields.email.$dirty).toBe(true);
    expect(vm.r$.$fields.user.$dirty).toBe(true);
    expect(vm.r$.$fields.user.$anyDirty).toBe(true);
    expect(vm.r$.$fields.user.$fields.firstName.$dirty).toBe(true);
    expect(vm.r$.$fields.user.$fields.lastName.$dirty).toBe(true);
    expect(vm.r$.$fields.contacts.$dirty).toBe(true);
    expect(vm.r$.$fields.contacts.$each[0].$dirty).toBe(true);
  });

  it('should update the `$dirty` state even if being cached before hand', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithComputedValidation);

    expect(vm.r$.$fields.email.$dirty).toBe(false);
    expect(vm.r$.$fields.user.$dirty).toBe(false);
    expect(vm.r$.$fields.user.$fields.firstName?.$dirty).toBe(undefined);
    expect(vm.r$.$fields.user.$fields.lastName?.$dirty).toBe(undefined);

    vm.state.userRequired = true;

    await vm.$nextTick();

    expect(vm.r$.$fields.email.$dirty).toBe(false);
    expect(vm.r$.$fields.user.$dirty).toBe(false);
    expect(vm.r$.$fields.user.$fields.firstName?.$dirty).toBe(false);
    expect(vm.r$.$fields.user.$fields.lastName?.$dirty).toBe(false);
  });
});
