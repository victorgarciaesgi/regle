import { useRegle, type InferSafeOutput, type MaybeOutput } from '@regle/core';
import { email, minLength, required, requiredIf } from '@regle/rules';
import { createRegleComponent } from '../../../utils/test.utils';

function simpleNestedStateWithMixedValidation() {
  interface Form {
    email?: string;
    date: Date;
    maybeUndefined: number;
    user?: {
      firstName?: string;
      lastName?: string;
    };
    contacts?: [{ name: string }];
    collection?: [{ name: string }];
  }

  const condition: boolean = true as boolean;

  return useRegle({} as Form, {
    email: { required },
    date: { required: requiredIf(false) },
    maybeUndefined: {
      ...(condition && {
        required,
      }),
    },
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
        maybeUndefined?: number | undefined;
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
        maybeUndefined?: MaybeOutput<number>;
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
      maybeUndefined?: number | undefined;
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

    const { r$ } = useRegle(
      { name: '', email: '' },
      {
        name: { required, minLength: minLength(4) },
        email: { email },
      }
    );

    const result = await r$.$validate();
    if (result.valid) {
      expectTypeOf(result.data.name).toEqualTypeOf<string>();
      expectTypeOf(result.data.email).toEqualTypeOf<string | undefined>();
    }
  });
});
