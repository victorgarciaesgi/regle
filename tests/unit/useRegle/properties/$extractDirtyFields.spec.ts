import { useRegle } from '@regle/core';
import { email, required } from '@regle/rules';
import { ref } from 'vue';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeInvalidField, shouldBeValidField } from '../../../utils/validations.utils';

describe('$extractDirtyFields', () => {
  function extractDirtyFieldsRegles() {
    const form = ref({
      email: '',
      user: {
        firstName: '',
        lastName: '',
      },
      contacts: [{ name: '' }, { name: '' }],
    });

    return useRegle(form, {
      email: { required: required, email: email },
      user: {
        firstName: { required },
        lastName: { required },
      },
      contacts: {
        $each: {
          name: { required },
        },
      },
    });
  }

  it('should return empty object if called directly', () => {
    const { vm } = createRegleComponent(extractDirtyFieldsRegles);

    let dirtyFields = vm.r$.$extractDirtyFields();

    expect(dirtyFields).toStrictEqual({});
  });

  it('should return whole object if called directly without filtering', () => {
    const { vm } = createRegleComponent(extractDirtyFieldsRegles);

    let dirtyFields = vm.r$.$extractDirtyFields(false);

    expect(dirtyFields).toStrictEqual({
      email: null,
      user: {
        firstName: null,
        lastName: null,
      },
      contacts: [{ name: null }, { name: null }],
    });
  });

  it('should return dirty fields after modifying them', async () => {
    const { vm } = createRegleComponent(extractDirtyFieldsRegles);

    vm.r$.$value.email = 'foo';
    vm.r$.$value.user.firstName = 'foo';
    vm.r$.$value.contacts[1].name = 'foo';
    await vm.$nextTick();

    let dirtyFields = vm.r$.$extractDirtyFields();

    expect(dirtyFields).toStrictEqual({
      email: 'foo',
      user: {
        firstName: 'foo',
      },
      contacts: [{}, { name: 'foo' }],
    });
  });

  it('should return whole tree after modifying them if filtering is disabled', async () => {
    const { vm } = createRegleComponent(extractDirtyFieldsRegles);

    vm.r$.$value.email = 'foo';
    vm.r$.$value.user.firstName = 'foo';
    vm.r$.$value.contacts[1].name = 'foo';
    await vm.$nextTick();

    let dirtyFields = vm.r$.$extractDirtyFields(false);

    expect(dirtyFields).toStrictEqual({
      email: 'foo',
      user: {
        firstName: 'foo',
        lastName: null,
      },
      contacts: [{ name: null }, { name: 'foo' }],
    });
  });
});
