import { useRegle, type RegleFieldStatus, type RegleShortcutDefinition } from '@regle/core';

describe('useRegle should throw errors for invalid rule schema', () => {
  it('Empty rules OK', () => {
    const { r$ } = useRegle({ name: '' }, {});
    expectTypeOf(r$.$fields.name).toEqualTypeOf<RegleFieldStatus<string, {}, RegleShortcutDefinition<any>>>();
    expectTypeOf(r$.$value.name).toEqualTypeOf<string>();
    expectTypeOf(r$.$errors.name).toEqualTypeOf<string[]>();
  });

  it('Empty property rule OK', () => {
    const { r$ } = useRegle({ name: '' }, { name: {} });
    expectTypeOf(r$.$fields.name).toEqualTypeOf<RegleFieldStatus<string, {}, RegleShortcutDefinition<any>>>();
    expectTypeOf(r$.$value.name).toEqualTypeOf<string>();
    expectTypeOf(r$.$errors.name).toEqualTypeOf<string[]>();
  });

  it('Known rules with inline validator OK', () => {
    const { r$ } = useRegle({ name: '' }, { name: { required: () => true } });
    expectTypeOf(r$.$fields.name).toEqualTypeOf<
      RegleFieldStatus<
        string,
        {
          required: () => true;
        },
        RegleShortcutDefinition<any>
      >
    >();
    expectTypeOf(r$.$value.name).toEqualTypeOf<string>();
    expectTypeOf(r$.$errors.name).toEqualTypeOf<string[]>();
    expectTypeOf(r$.$fields.name.$rules.required);
  });

  // @ts-expect-error Known rules with inline validator NOT OK ❌
  useRegle({ name: '' }, { name: { required: () => 'foo' } });

  // Known rules with inline validator with no types
  useRegle({ name: '' }, { name: { required: (value) => true } });

  // Any rule name
  useRegle({ name: '' }, { name: { baguette: (value) => true } });

  // @ts-expect-error Known rules with invalid inline validator parameter NOT OK ❌
  useRegle({ name: '' }, { name: { required: (value: string) => true } });

  it('Known rules with inline validator returning metadata ✅', () => {
    const { r$ } = useRegle({ name: '' }, { name: { required: (value) => ({ $valid: true }) } });
    expectTypeOf(r$.$fields.name.$rules.required.$metadata).toEqualTypeOf<{ $valid: true }>();
  });

  // @ts-expect-error Incorrect property ❌
  useRegle({ name: '' }, { incorrect: { required: () => true } });

  // @ts-expect-error Incorrect nested property ❌
  useRegle({ name: { nested: '' } }, { name: { incorrect: { required: () => true } } });
});
