import { nextTick } from 'vue';
import { simpleNestedStateWithMixedValidation } from '../../../fixtures';
import { createRegleComponent } from '../../../utils/test.utils';

describe('$silentErrors', () => {
  it('constructs an array of errors for invalid properties', async () => {
    const { vm } = await createRegleComponent(simpleNestedStateWithMixedValidation);

    let expectedErrors1 = {
      contacts: {
        $each: [
          {
            name: [],
          },
        ],
        $errors: [],
      },
      email: [],
      user: {
        firstName: [],
        lastName: [],
      },
    };

    expect(vm.r$.$errors).toStrictEqual(expectedErrors1);

    vm.r$.$touch();

    let expectedErrors2 = {
      contacts: {
        $each: [
          {
            name: ['This field is required'],
          },
        ],
        $errors: [],
      },
      email: ['This field is required'],
      user: {
        firstName: ['This field is required'],
        lastName: ['This field is required'],
      },
    };

    expect(vm.r$.$errors).toStrictEqual(expectedErrors2);

    vm.r$.$value.email = 'foo';

    await nextTick();

    let expectedErrors3 = {
      contacts: {
        $each: [
          {
            name: ['This field is required'],
          },
        ],
        $errors: [],
      },
      email: ['Value must be an valid email address'],
      user: {
        firstName: ['This field is required'],
        lastName: ['This field is required'],
      },
    };

    expect(vm.r$.$errors).toStrictEqual(expectedErrors3);
  });
});
