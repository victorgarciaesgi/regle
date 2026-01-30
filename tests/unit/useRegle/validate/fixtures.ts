import { useRegle } from '@regle/core';
import { required, requiredIf, checked } from '@regle/rules';

export function simpleNestedStateWithMixedValidation() {
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
    file: File;
    booleanField?: boolean;
    address?: {
      street?: string;
      city?: string;
    };
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
    booleanField: { checked },
    collection: {
      required,
    },
    file: { required, otherValidation: (value) => value instanceof File },
    address: {
      $self: {
        required,
      },
    },
  });
}
