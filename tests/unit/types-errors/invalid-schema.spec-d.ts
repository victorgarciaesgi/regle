import { inferRules, useRegle, type RegleFieldStatus, type RegleShortcutDefinition } from '@regle/core';

describe('useRegle should throw errors for invalid rule schema', () => {
  it('Empty rules OK', () => {
    const { r$ } = useRegle({ name: '' }, {});

    expectTypeOf(r$.name).toEqualTypeOf<RegleFieldStatus<string, {}, RegleShortcutDefinition<any>>>();
    expectTypeOf(r$.$value.name).toEqualTypeOf<string>();
    expectTypeOf(r$.$errors.name).toEqualTypeOf<string[]>();
  });

  it('Empty property rule OK', () => {
    const { r$ } = useRegle({ name: '' }, { name: {} });
    expectTypeOf(r$.name).toEqualTypeOf<RegleFieldStatus<string, {}, RegleShortcutDefinition<any>>>();
    expectTypeOf(r$.$value.name).toEqualTypeOf<string>();
    expectTypeOf(r$.$errors.name).toEqualTypeOf<string[]>();
  });

  it('Known rules with inline validator OK', () => {
    const { r$ } = useRegle({ name: '' }, { name: { required: () => true } });
    expectTypeOf(r$.name).toEqualTypeOf<
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
    expectTypeOf(r$.name.$rules.required);
  });

  // TODO Disabled for now
  it('useRegle should report wrong types', () => {
    // @ts-expect-error Known rules with inline validator NOT OK ❌
    useRegle({ name: '' }, { name: { required: () => 'foo' } });

    // ✅ Known rules with inline validator with no types
    useRegle({ name: '' }, { name: { required: (value) => true } });

    // ✅ Any rule name
    useRegle({ name: '' }, { name: { baguette: (value) => true } });

    // @ts-expect-error Known rules with invalid inline validator parameter NOT OK ❌
    useRegle({ name: '' }, { name: { required: (value: string) => true } });

    // @ts-expect-error Incorrect property ❌
    useRegle({ name: '' }, { incorrect: { required: () => true } });

    // @ts-expect-error Incorrect property ❌
    useRegle({ name: '' }, { name: { required: () => true }, incorrect: { required: () => true } });

    // @ts-expect-error Incorrect property ❌
    useRegle({ name: '' }, () => ({ incorrect: { required: () => true } }));

    // ✅ correct schema with getter
    useRegle({ name: '' }, () => ({ name: { required: () => true } }));

    useRegle(
      { name: { nested: '' } },
      // @ts-expect-error Incorrect nested property ❌
      { name: { nested: { required: () => true }, incorrect: { required: () => true } } }
    );

    // @ts-expect-error Incorrect nested property ❌
    useRegle({ name: { nested: '' } }, () => ({
      name: { nested: { required: () => true }, incorrect: { required: () => false } },
    }));

    // ✅ correct schema
    useRegle({ name: { nested: '' } }, { name: { nested: { required: () => true, baguette: () => true } } });
  });

  it('inferRules should report wrong types', () => {
    // @ts-expect-error Known rules with inline validator NOT OK ❌
    inferRules({ name: '' }, { name: { required: () => 'foo' } });

    // ✅ Known rules with inline validator with no types
    inferRules({ name: '' }, { name: { required: (value) => true } });

    // ✅ Any rule name
    inferRules({ name: '' }, { name: { baguette: (value) => true } });

    // @ts-expect-error Known rules with invalid inline validator parameter NOT OK ❌
    inferRules({ name: '' }, { name: { required: (value: string) => true } });

    // @ts-expect-error Incorrect property ❌
    inferRules({ name: '' }, { incorrect: { required: () => true } });

    // @ts-expect-error Incorrect property ❌
    inferRules({ name: '' }, { name: { required: () => true }, incorrect: { required: () => true } });

    // @ts-expect-error Incorrect property ❌
    inferRules({ name: '' }, () => ({ incorrect: { required: () => true } }));

    inferRules(
      { name: { nested: '' } },
      // @ts-expect-error Incorrect nested property ❌
      { name: { nested: { required: () => true }, incorrect: { required: () => true } } }
    );

    // ✅ correct schema
    inferRules({ name: { nested: '' } }, { name: { nested: { required: () => true, baguette: () => true } } });
  });

  it('Known rules with inline validator returning metadata ✅', () => {
    const { r$ } = useRegle({ name: '' }, { name: { required: (value) => ({ $valid: true, customMeta: 'bar' }) } });
    expectTypeOf(r$.name.$rules.required.$metadata).toEqualTypeOf<{ customMeta: string }>();
  });
});
