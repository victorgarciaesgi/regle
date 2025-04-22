import { simpleNestedStateWithMixedValidation } from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';

describe('$silentErrors', () => {
  it('constructs an array of errors for invalid properties', async () => {
    const { vm } = createRegleComponent(simpleNestedStateWithMixedValidation);

    expect(vm.r$.$silentErrors).toStrictEqual({
      contacts: {
        $each: [
          {
            name: ['This field is required'],
          },
        ],
        $self: [],
      },
      email: ['This field is required'],
      user: {
        firstName: ['This field is required'],
        lastName: ['This field is required'],
      },
    });

    expect(vm.r$.$fields.contacts.$each[0].$fields.name.$silentErrors).toStrictEqual(['This field is required']);
    expect(vm.r$.$fields.email.$silentErrors).toStrictEqual(['This field is required']);
    expect(vm.r$.$fields.user.$fields.firstName.$silentErrors).toStrictEqual(['This field is required']);
    expect(vm.r$.$fields.user.$fields.lastName.$silentErrors).toStrictEqual(['This field is required']);

    vm.r$.$value.email = 'foo';
    await vm.$nextTick();

    expect(vm.r$.$fields.email.$silentErrors).toStrictEqual(['The value must be an valid email address']);
  });
});
