import { simpleNestedStateWithComputedValidation, simpleNestedStateWithMixedValidation } from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';

describe('.$touch', () => {
  it('should update the `$dirty` state to `true`, on used property', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

    expect(vm.r$.email.$dirty).toBe(false);
    expect(vm.r$.user.$dirty).toBe(false);
    expect(vm.r$.user.firstName.$dirty).toBe(false);
    expect(vm.r$.user.lastName.$dirty).toBe(false);
    expect(vm.r$.contacts.$dirty).toBe(false);

    vm.r$.email.$touch();
    vm.r$.user.lastName.$touch();

    await vm.$nextTick();

    expect(vm.r$.email.$dirty).toBe(true);
    expect(vm.r$.user.$dirty).toBe(false);
    expect(vm.r$.user.$anyDirty).toBe(true);
    expect(vm.r$.user.firstName.$dirty).toBe(false);
    expect(vm.r$.user.lastName.$dirty).toBe(true);
    expect(vm.r$.contacts.$dirty).toBe(false);

    vm.r$.user.firstName.$touch();

    await vm.$nextTick();

    expect(vm.r$.user.$dirty).toBe(true);
  });

  it('should update the `$dirty` state to `true` on all nested properties', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

    expect(vm.r$.user.$dirty).toBe(false);
    expect(vm.r$.user.firstName.$dirty).toBe(false);
    expect(vm.r$.user.lastName.$dirty).toBe(false);

    vm.r$.user.$touch();

    await vm.$nextTick();

    expect(vm.r$.user.$anyDirty).toBe(true);
    expect(vm.r$.user.firstName.$dirty).toBe(true);
    expect(vm.r$.user.lastName.$dirty).toBe(true);
  });

  it("should not update the `$dirty` state on the property it wasn't used on", async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

    expect(vm.r$.email.$invalid).toBe(true);
    expect(vm.r$.email.$error).toBe(false);
    expect(vm.r$.email.$correct).toBe(false);

    vm.r$.email.$touch();

    await vm.$nextTick();

    expect(vm.r$.email.$error).toBe(true);
  });

  it('should update the `$dirty` state to `true` on all properties, when used on top level node', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

    vm.r$.$touch();

    await vm.$nextTick();

    expect(vm.r$.email.$dirty).toBe(true);
    expect(vm.r$.user.$dirty).toBe(true);
    expect(vm.r$.user.$anyDirty).toBe(true);
    expect(vm.r$.user.firstName.$dirty).toBe(true);
    expect(vm.r$.user.lastName.$dirty).toBe(true);
    expect(vm.r$.contacts.$dirty).toBe(true);
    expect(vm.r$.contacts.$each[0].$dirty).toBe(true);
  });

  it('should update the `$dirty` state even if being cached before hand', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithComputedValidation);

    expect(vm.r$.email.$dirty).toBe(false);
    expect(vm.r$.user.$dirty).toBe(false);
    expect(vm.r$.user.firstName?.$dirty).toBe(false);
    expect(vm.r$.user.lastName?.$dirty).toBe(false);

    vm.r$.$value.userRequired = true;

    await vm.$nextTick();

    expect(vm.r$.email.$dirty).toBe(false);
    expect(vm.r$.user.$dirty).toBe(false);
    expect(vm.r$.user.firstName?.$dirty).toBe(false);
    expect(vm.r$.user.lastName?.$dirty).toBe(false);
  });
});
