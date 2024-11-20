import { useRegle } from '@regle/core';
import { email, maxValue, minLength, numeric, required } from '@regle/rules';

export function useMyForm() {
  return useRegle(
    { email: '', user: { firstName: '', lastName: '' } },
    {
      email: { required, email: email },
      user: {
        firstName: {
          required,
          minLength: minLength(6),
        },
        lastName: {
          minLength: minLength(6),
        },
      },
    }
  );
}
