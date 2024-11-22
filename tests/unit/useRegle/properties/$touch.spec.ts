import {
  simpleNestedStateWithComputedValidation,
  simpleNestedStateWithMixedValidation,
} from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';

describe('.$touch', () => {
  it('should update the `$dirty` state to `true`, on used property', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

    expect(vm.regle.$fields.email.$dirty).toBe(false);
    expect(vm.regle.$fields.user.$dirty).toBe(false);
    expect(vm.regle.$fields.user.$fields.firstName.$dirty).toBe(false);
    expect(vm.regle.$fields.user.$fields.lastName.$dirty).toBe(false);
    expect(vm.regle.$fields.contacts.$dirty).toBe(false);

    vm.regle.$fields.email.$touch();
    vm.regle.$fields.user.$fields.lastName.$touch();

    await vm.$nextTick();

    expect(vm.regle.$fields.email.$dirty).toBe(true);
    expect(vm.regle.$fields.user.$dirty).toBe(false);
    expect(vm.regle.$fields.user.$anyDirty).toBe(true);
    expect(vm.regle.$fields.user.$fields.firstName.$dirty).toBe(false);
    expect(vm.regle.$fields.user.$fields.lastName.$dirty).toBe(true);
    expect(vm.regle.$fields.contacts.$dirty).toBe(false);

    vm.regle.$fields.user.$fields.firstName.$touch();

    await vm.$nextTick();

    expect(vm.regle.$fields.user.$dirty).toBe(true);
  });

  it('should update the `$dirty` state to `true` on all nested properties', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

    expect(vm.regle.$fields.user.$dirty).toBe(false);
    expect(vm.regle.$fields.user.$fields.firstName.$dirty).toBe(false);
    expect(vm.regle.$fields.user.$fields.lastName.$dirty).toBe(false);

    vm.regle.$fields.user.$touch();

    await vm.$nextTick();

    expect(vm.regle.$fields.user.$anyDirty).toBe(true);
    expect(vm.regle.$fields.user.$fields.firstName.$dirty).toBe(true);
    expect(vm.regle.$fields.user.$fields.lastName.$dirty).toBe(true);
  });

  it('should not update the `$dirty` state on the property it wasnt used on', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

    expect(vm.regle.$fields.email.$invalid).toBe(true);
    expect(vm.regle.$fields.email.$error).toBe(false);
    expect(vm.regle.$fields.email.$valid).toBe(false);

    vm.regle.$fields.email.$touch();

    await vm.$nextTick();

    expect(vm.regle.$fields.email.$error).toBe(true);
  });

  it('should update the `$dirty` state to `true` on all properties, when used on top level node', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

    vm.regle.$touch();

    await vm.$nextTick();

    expect(vm.regle.$fields.email.$dirty).toBe(true);
    expect(vm.regle.$fields.user.$dirty).toBe(true);
    expect(vm.regle.$fields.user.$anyDirty).toBe(true);
    expect(vm.regle.$fields.user.$fields.firstName.$dirty).toBe(true);
    expect(vm.regle.$fields.user.$fields.lastName.$dirty).toBe(true);
    expect(vm.regle.$fields.contacts.$dirty).toBe(true);
    expect(vm.regle.$fields.contacts.$each[0].$dirty).toBe(true);
  });

  it('should update the `$dirty` state even if being cached before hand', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithComputedValidation);

    expect(vm.regle.$fields.email.$dirty).toBe(false);
    expect(vm.regle.$fields.user.$dirty).toBe(false);
    expect(vm.regle.$fields.user.$fields.firstName?.$dirty).toBe(undefined);
    expect(vm.regle.$fields.user.$fields.lastName?.$dirty).toBe(undefined);

    vm.state.userRequired = true;

    await vm.$nextTick();

    expect(vm.regle.$fields.email.$dirty).toBe(false);
    expect(vm.regle.$fields.user.$dirty).toBe(false);
    expect(vm.regle.$fields.user.$fields.firstName?.$dirty).toBe(false);
    expect(vm.regle.$fields.user.$fields.lastName?.$dirty).toBe(false);
  });
});
