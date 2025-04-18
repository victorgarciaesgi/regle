import { useRegle, type InferSafeOutput, type MaybeOutput } from '@regle/core';
import { required } from '@regle/rules';
import { createRegleComponent } from '../../../utils/test.utils';

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

    const { valid, data } = await vm.r$.$validate();

    if (valid) {
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
        email?: MaybeOutput<string>;
        date?: MaybeOutput<Date>;
        user?: {
          firstName?: MaybeOutput<string>;
          lastName?: MaybeOutput<string>;
        };
        contacts?: {
          name?: MaybeOutput<string>;
        }[];
        collection?: {
          name?: MaybeOutput<string>;
        }[];
      }>();
    }

    // InferSafeOutput type

    expectTypeOf<InferSafeOutput<typeof vm.r$>>().toEqualTypeOf<{
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
  });
});
