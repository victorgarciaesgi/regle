import { simpleNestedStateWithMixedValidation } from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';

describe('$silentErrors', () => {
  it('constructs an array of errors for invalid properties', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);
    expect(vm.r$.$silentErrors).toStrictEqual({
      contacts: {
        $each: [
          {
            name: ['This field is required'],
          },
        ],
        $errors: [],
      },
      email: ['This field is required', 'Value must be an valid email address'],
      user: {
        firstName: ['This field is required'],
        lastName: ['This field is required'],
      },
    });
  });
});
