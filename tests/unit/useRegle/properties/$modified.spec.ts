import { useRegle, type isEditedHandlerFn, type RegleBehaviourOptions } from '@regle/core';
import { required } from '@regle/rules';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';

describe('$modified', () => {
  function modifiedForm(options: RegleBehaviourOptions = {}) {
    return () => {
      const form = ref({
        email: 'initial',
        user: { firstName: '', lastName: '' },
        contacts: [{ name: 'foo' }],
      });
      return useRegle(
        form,
        {
          email: { required },
          user: { firstName: { required }, lastName: { required } },
          contacts: { $each: { name: { required } } },
        },
        options
      );
    };
  }

  it('should track value changes without depending on $dirty (autoDirty: false)', async () => {
    const { vm } = createRegleComponent(modifiedForm({ autoDirty: false, lazy: true }));

    expect(vm.r$.$modified).toBe(false);
    expect(vm.r$.$anyModified).toBe(false);
    expect(vm.r$.email.$modified).toBe(false);

    vm.r$.$value.email = 'changed';
    await vm.$nextTick();

    expect(vm.r$.email.$modified).toBe(true);
    expect(vm.r$.email.$anyModified).toBe(true);
    expect(vm.r$.$anyModified).toBe(true);
    expect(vm.r$.$modified).toBe(false);

    // Doesn't affect dirty state or error display
    expect(vm.r$.email.$dirty).toBe(false);
    expect(vm.r$.email.$edited).toBe(false);
    expect(vm.r$.$anyEdited).toBe(false);
    expect(vm.r$.$errors.email).toStrictEqual([]);

    vm.r$.$value.email = 'initial';
    await vm.$nextTick();

    expect(vm.r$.email.$modified).toBe(false);
    expect(vm.r$.$anyModified).toBe(false);

    // nested
    vm.r$.$value.user.firstName = 'John';
    await vm.$nextTick();

    expect(vm.r$.user.firstName.$modified).toBe(true);
    expect(vm.r$.user.$modified).toBe(false);
    expect(vm.r$.user.$anyModified).toBe(true);

    vm.r$.$value.user.lastName = 'Doe';
    await vm.$nextTick();

    expect(vm.r$.user.$modified).toBe(true);
    expect(vm.r$.user.$dirty).toBe(false);

    // collections
    vm.r$.$value.contacts[0].name = 'bar';
    await vm.$nextTick();

    expect(vm.r$.contacts.$each[0].name.$modified).toBe(true);
    expect(vm.r$.contacts.$modified).toBe(true);
    expect(vm.r$.contacts.$anyModified).toBe(true);
    expect(vm.r$.contacts.$dirty).toBe(false);
  });

  it('should be true with autoDirty too, and match $edited once dirty', async () => {
    const { vm } = createRegleComponent(modifiedForm());

    vm.r$.email.$silentValue = 'silent';
    await vm.$nextTick();

    expect(vm.r$.email.$dirty).toBe(false);
    expect(vm.r$.email.$edited).toBe(false);
    expect(vm.r$.email.$modified).toBe(true);

    vm.r$.$value.email = 'changed';
    await vm.$nextTick();

    expect(vm.r$.email.$dirty).toBe(true);
    expect(vm.r$.email.$edited).toBe(true);
    expect(vm.r$.email.$modified).toBe(true);
  });

  it('should be re-baselined by $reset', async () => {
    const { vm } = createRegleComponent(modifiedForm({ autoDirty: false }));

    vm.r$.$value.email = 'changed';
    await vm.$nextTick();
    expect(vm.r$.email.$modified).toBe(true);

    vm.r$.$reset();
    await vm.$nextTick();
    expect(vm.r$.email.$modified).toBe(false);
    expect(vm.r$.$anyModified).toBe(false);

    vm.r$.$value.email = 'other';
    await vm.$nextTick();
    expect(vm.r$.email.$modified).toBe(true);

    vm.r$.$reset({ toInitialState: true });
    await vm.$nextTick();
    expect(vm.r$.$value.email).toBe('changed');
    expect(vm.r$.email.$modified).toBe(false);

    vm.r$.$reset({ toState: { email: 'server', user: { firstName: '', lastName: '' }, contacts: [{ name: 'foo' }] } });
    await vm.$nextTick();
    expect(vm.r$.$value.email).toBe('server');
    expect(vm.r$.email.$modified).toBe(false);
    expect(vm.r$.$anyModified).toBe(false);
  });

  it('should honour the $isEdited override', async () => {
    const caseInsensitive: isEditedHandlerFn<string> = (current, initial) =>
      current?.toLowerCase() !== initial?.toLowerCase();

    const { vm } = createRegleComponent(() => {
      const form = ref({ email: 'initial' });
      return useRegle(form, { email: { required, $isEdited: caseInsensitive } }, { autoDirty: false });
    });

    vm.r$.$value.email = 'INITIAL';
    await vm.$nextTick();
    expect(vm.r$.email.$modified).toBe(false);

    vm.r$.$value.email = 'other';
    await vm.$nextTick();
    expect(vm.r$.email.$modified).toBe(true);
  });
});
