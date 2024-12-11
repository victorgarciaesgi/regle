import { createRegleComponent } from '../../../utils/test.utils';
import { useRegle, type Maybe } from '@regle/core';
import { email, required } from '@regle/rules';

function simpleNestedStateWithMixedValidation() {
  interface Form {
    email?: string;
    date: Date;
    user?: {
      firstName?: string;
      lastName?: string;
    };
    contacts?: [{ name: string }];
    collection?: [{ name: string }];
  }

  return useRegle({} as Form, {
    email: { required },
    user: {
      firstName: { required },
    },
    contacts: {
      $each: {
        name: { required },
      },
    },
    collection: {
      required,
    },
  });
}

describe('$validate', () => {
  it('should have a deep safe form if the result is true', async () => {
    const { vm } = createRegleComponent(simpleNestedStateWithMixedValidation);

    const { result, data } = await vm.r$.$validate();

    // TODO handle optional objects/arrays
    if (result) {
      expectTypeOf(data).toEqualTypeOf<{
        email: string;
        date?: Date | undefined;
        user: {
          lastName?: string | undefined;
          firstName: string;
        };
        contacts: {
          name: string;
        }[];
        collection: {
          name: string;
        }[];
      }>();
    } else {
      expectTypeOf(data).toEqualTypeOf<{
        email?: Maybe<string | undefined>;
        date?: Maybe<Date>;
        user?: {
          firstName?: Maybe<string | undefined>;
          lastName?: Maybe<string | undefined>;
        };
        contacts?: {
          name?: Maybe<string>;
        }[];
        collection?: {
          name?: Maybe<string>;
        }[];
      }>();
    }
  });
});
