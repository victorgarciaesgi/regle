import { useRegle, useScopedRegle } from '#imports';
import { required } from '@regle/rules';
import { describe, it, expectTypeOf } from 'vitest';

describe('test.types', () => {
  it('should have correct types', () => {
    const { r$ } = useRegle({ email: '' }, { email: { required } });
    expectTypeOf(r$.email.$value).toEqualTypeOf<string | undefined>();
    expectTypeOf(r$.email.$errors).toEqualTypeOf<string[]>();
    expectTypeOf(r$.email.$rules.required?.$active).toEqualTypeOf<boolean>();
    expectTypeOf(r$.email.$rules.required?.$message).toEqualTypeOf<string | string[]>();
    expectTypeOf(r$.email.$rules.required?.$message).toEqualTypeOf<string | string[]>();

    const { r$: r$2 } = useScopedRegle({ email: '' }, { email: { required } });
    expectTypeOf(r$2.email.$value).toEqualTypeOf<string | undefined>();
    expectTypeOf(r$2.email.$errors).toEqualTypeOf<string[]>();
    expectTypeOf(r$2.email.$rules.required?.$active).toEqualTypeOf<boolean>();
    expectTypeOf(r$2.email.$rules.required?.$message).toEqualTypeOf<string | string[]>();
    expectTypeOf(r$2.email.$rules.required?.$message).toEqualTypeOf<string | string[]>();
  });
});
