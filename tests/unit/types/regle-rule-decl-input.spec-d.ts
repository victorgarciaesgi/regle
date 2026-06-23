import { expectTypeOf } from 'vitest';
import { ref } from 'vue';
import { inferRules, useRegle } from '@regle/core';
import { email, minLength, required } from '@regle/rules';

describe('RegleRuleDeclInput regressions', () => {
  it('useRegle rules object keeps built-in validator autocomplete', () => {
    useRegle(ref({ name: '', email: '' }), {
      name: { required, minLength: minLength(2) },
      email: { required, email },
    });
  });

  it('inferRules keeps built-in validator autocomplete', () => {
    const form = ref({ name: '' });
    inferRules(form, { name: { required, minLength: minLength(2) } });
  });

  it('$addRules keeps built-in validator autocomplete on field status', () => {
    const { r$ } = useRegle(ref({ name: '' }), { name: { required } });
    r$.name.$addRules({ minLength: minLength(3), email });
  });

  it('$addRules keeps built-in validator autocomplete on single-field regle', () => {
    const { r$ } = useRegle(ref(''), { required });
    r$.$addRules({ minLength: minLength(3), email });
  });

  it('ProcessNestedFields still discriminates field rules from nested objects', () => {
    const { r$ } = useRegle(
      ref({
        email: '',
        user: { firstName: '', lastName: '' },
      }),
      {
        email: { required, email },
        user: {
          firstName: { required },
          lastName: { required },
        },
      }
    );

    expectTypeOf(r$.email.$dirty).toEqualTypeOf<boolean>();
    expectTypeOf(r$.user.firstName.$dirty).toEqualTypeOf<boolean>();

    // @ts-expect-error - email is a field, not a nested form with firstName
    // oxlint-disable-next-line no-unused-expressions
    r$.email.firstName;
  });
});
