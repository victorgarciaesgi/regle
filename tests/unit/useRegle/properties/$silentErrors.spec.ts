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

    expect(vm.r$.contacts.$each[0].name.$silentErrors).toStrictEqual(['This field is required']);
    expect(vm.r$.email.$silentErrors).toStrictEqual(['This field is required']);
    expect(vm.r$.user.firstName.$silentErrors).toStrictEqual(['This field is required']);
    expect(vm.r$.user.lastName.$silentErrors).toStrictEqual(['This field is required']);

    vm.r$.$value.email = 'foo';
    await vm.$nextTick();

    expect(vm.r$.email.$silentErrors).toStrictEqual(['The value must be a valid email address']);
  });
});
