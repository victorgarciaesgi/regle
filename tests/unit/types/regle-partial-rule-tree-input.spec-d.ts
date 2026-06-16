import { expectTypeOf } from 'vitest';
import { computed, ref } from 'vue';
import { useRegle, type RegleComputedRules, type ReglePartialRuleTreeInput } from '@regle/core';
import { email, minLength, required } from '@regle/rules';

describe('ReglePartialRuleTreeInput regressions', () => {
  it('useRegle keeps nested field and validator autocomplete', () => {
    const { r$ } = useRegle(
      ref({
        email: '',
        user: { firstName: '', lastName: '' },
      }),
      {
        email: { required, email },
        user: {
          firstName: { required, minLength: minLength(2) },
          lastName: { required },
        },
      }
    );

    expectTypeOf(r$.email.$dirty).toEqualTypeOf<boolean>();
    expectTypeOf(r$.user.firstName.$dirty).toEqualTypeOf<boolean>();
  });

  it('RegleComputedRules keeps validator autocomplete with satisfies', () => {
    const form = ref({ name: '' });

    computed(
      () =>
        ({
          name: { required, minLength: minLength(2) },
        }) satisfies RegleComputedRules<typeof form>
    );
  });

  it('ReglePartialRuleTreeInput accepts built-in validators on nested trees', () => {
    const rules = {
      profile: {
        email: { required, email },
      },
    } satisfies ReglePartialRuleTreeInput<{ profile: { email: string } }>;

    expectTypeOf(rules.profile.email).toBeObject();
  });
});
