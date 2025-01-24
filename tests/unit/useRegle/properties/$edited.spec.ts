import { simpleNestedStateWithMixedValidation } from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';

describe('$edited', () => {
  it('should be true when value is not the same as initial one', async () => {
    const { vm } = createRegleComponent(simpleNestedStateWithMixedValidation);

    vm.r$.$value.email = 'edited';
    await vm.$nextTick();

    expect(vm.r$.$fields.email.$edited).toBe(true);
    expect(vm.r$.$anyEdited).toBe(true);

    vm.r$.$value.email = '';
    await vm.$nextTick();

    expect(vm.r$.$fields.email.$edited).toBe(false);
    expect(vm.r$.$anyEdited).toBe(false);

    // shouldn't be considered as a Date
    vm.r$.$value.email = 'test 1';
    await vm.$nextTick();
    vm.r$.$reset();
    await vm.$nextTick();

    expect(vm.r$.$fields.email.$edited).toBe(false);
    expect(vm.r$.$anyEdited).toBe(false);

    vm.r$.$value.email = 'test 2';
    await vm.$nextTick();

    expect(vm.r$.$fields.email.$edited).toBe(true);
    expect(vm.r$.$anyEdited).toBe(true);

    vm.r$.$value.email = 'test 1';
    await vm.$nextTick();

    expect(vm.r$.$fields.email.$edited).toBe(false);
    expect(vm.r$.$anyEdited).toBe(false);

    // nested

    vm.r$.$value.user.firstName = 'new value';
    await vm.$nextTick();

    expect(vm.r$.$fields.user.$edited).toBe(false);
    expect(vm.r$.$fields.user.$fields.firstName.$edited).toBe(true);
    expect(vm.r$.$anyEdited).toBe(true);
    expect(vm.r$.$fields.user.$anyEdited).toBe(true);

    vm.r$.$reset();
    await vm.$nextTick();

    expect(vm.r$.$fields.user.$edited).toBe(false);
    expect(vm.r$.$fields.user.$fields.firstName.$edited).toBe(false);
    expect(vm.r$.$anyEdited).toBe(false);
    expect(vm.r$.$fields.user.$anyEdited).toBe(false);

    vm.r$.$value.user.firstName = 'edited';
    await vm.$nextTick();

    expect(vm.r$.$fields.user.$edited).toBe(false);
    expect(vm.r$.$fields.user.$fields.firstName.$edited).toBe(true);
    expect(vm.r$.$anyEdited).toBe(true);
    expect(vm.r$.$fields.user.$anyEdited).toBe(true);

    vm.r$.$value.user.firstName = 'new value';
    await vm.$nextTick();

    expect(vm.r$.$fields.user.$edited).toBe(false);
    expect(vm.r$.$fields.user.$fields.firstName.$edited).toBe(false);
    expect(vm.r$.$anyEdited).toBe(false);
    expect(vm.r$.$fields.user.$anyEdited).toBe(false);

    // collections

    vm.r$.$value.contacts[0].name = 'new value';
    await vm.$nextTick();

    expect(vm.r$.$fields.contacts.$each[0].$fields.name.$edited).toBe(true);
    expect(vm.r$.$fields.contacts.$edited).toBe(true);
    expect(vm.r$.$anyEdited).toBe(true);
    expect(vm.r$.$fields.contacts.$anyEdited).toBe(true);

    vm.r$.$reset();
    await vm.$nextTick();

    expect(vm.r$.$fields.contacts.$each[0].$fields.name.$edited).toBe(false);
    expect(vm.r$.$fields.contacts.$edited).toBe(false);
    expect(vm.r$.$anyEdited).toBe(false);
    expect(vm.r$.$fields.contacts.$anyEdited).toBe(false);

    vm.r$.$value.contacts[0].name = 'edited';
    await vm.$nextTick();

    expect(vm.r$.$fields.contacts.$each[0].$fields.name.$edited).toBe(true);
    expect(vm.r$.$fields.contacts.$edited).toBe(true);
    expect(vm.r$.$anyEdited).toBe(true);
    expect(vm.r$.$fields.contacts.$anyEdited).toBe(true);

    vm.r$.$value.contacts.push({ name: '' });
    await vm.$nextTick();
    vm.r$.$fields.contacts.$touch();
    await vm.$nextTick();

    expect(vm.r$.$fields.contacts.$each[0].$fields.name.$edited).toBe(true);
    expect(vm.r$.$fields.contacts.$each[1].$fields.name.$edited).toBe(false);
    expect(vm.r$.$fields.contacts.$edited).toBe(false);
    expect(vm.r$.$anyEdited).toBe(true);
    expect(vm.r$.$fields.contacts.$anyEdited).toBe(true);

    vm.r$.$reset();
    await vm.$nextTick();

    expect(vm.r$.$fields.contacts.$each[0].$fields.name.$edited).toBe(false);
    expect(vm.r$.$fields.contacts.$each[1].$fields.name.$edited).toBe(false);
    expect(vm.r$.$fields.contacts.$edited).toBe(false);
    expect(vm.r$.$anyEdited).toBe(false);
    expect(vm.r$.$fields.contacts.$anyEdited).toBe(false);

    vm.r$.$value.contacts[1].name = 'edited';
    await vm.$nextTick();

    expect(vm.r$.$fields.contacts.$each[0].$fields.name.$edited).toBe(false);
    expect(vm.r$.$fields.contacts.$each[1].$fields.name.$edited).toBe(true);
    expect(vm.r$.$fields.contacts.$edited).toBe(false);
    expect(vm.r$.$anyEdited).toBe(true);
    expect(vm.r$.$fields.contacts.$anyEdited).toBe(true);

    vm.r$.$value.contacts.splice(0, 1);
    await vm.$nextTick();

    expect(vm.r$.$fields.contacts.$each[0].$fields.name.$edited).toBe(true);
    expect(vm.r$.$fields.contacts.$edited).toBe(true);
    expect(vm.r$.$anyEdited).toBe(true);
    expect(vm.r$.$fields.contacts.$anyEdited).toBe(true);
  });
});
