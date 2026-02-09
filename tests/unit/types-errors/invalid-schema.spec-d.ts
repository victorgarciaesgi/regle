import {
  inferRules,
  useRegle,
  type MaybeOutput,
  type RegleFieldStatus,
  type RegleShortcutDefinition,
} from '@regle/core';
import { email, minLength, required } from '@regle/rules';
import { ref } from 'vue';
import type { Ref } from 'vue';

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
          required: () => boolean;
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

    // Known rules with inline validator with no types ✅
    useRegle({ name: '' }, { name: { required: (_value) => true } });

    // Any rule name ✅
    useRegle({ name: '' }, { name: { baguette: (_value) => true } });

    // @ts-expect-error Known rules with invalid inline validator parameter NOT OK ❌
    useRegle({ name: '' }, { name: { required: (_value: string) => true } });

    // @ts-expect-error Incorrect property ❌
    useRegle({ name: '' }, { incorrect: { required: () => true } });

    // @ts-expect-error Incorrect property ❌
    useRegle({ name: '' }, { name: { $autoDirty: 4 } });

    // @ts-expect-error Incorrect property ❌
    useRegle({ name: '' }, { name: { required: false } });

    // TODO Abandonned for now, too complex to handle DeepExact
    // // @ts-expect-error Incorrect property ❌
    // useRegle({ name: '' }, { name: { required: () => true }, incorrect: { required: () => true } });

    // @ts-expect-error Incorrect property ❌
    useRegle({ name: '' }, () => ({ incorrect: { required: () => true } }));

    // correct schema with getter ✅
    useRegle({ name: '' }, () => ({ name: { required: () => true } }));

    // correct collection schema with nested property ✅
    useRegle(
      { name: [{ nested: '' }] },
      {
        name: {
          required,
          minLength: minLength(4),
          $deepCompare: true,
          $autoDirty: false,
          $each: {
            nested: { required, minLength: minLength(4) },
          },
        },
      }
    );

    // correct collection schema with nestedgetter ✅
    useRegle(
      { name: [{ nested: '' }] },
      {
        name: {
          required,
          minLength: minLength(4),
          $deepCompare: true,
          $autoDirty: false,
          $each: (value, index) => {
            expectTypeOf(index).toEqualTypeOf<number>();
            expectTypeOf(value).toEqualTypeOf<Ref<{ nested: string }>>();
            return {
              nested: { required, minLength: minLength(4) },
            };
          },
        },
      }
    );

    // TODO Abandonned for now, too complex to handle DeepExact
    // useRegle(
    //   { name: { nested: '' } },
    //   // @ts-expect-error Incorrect nested property ❌
    //   { name: { nested: { required: () => true }, incorrect: { required: () => true } } }
    // );

    // TODO Abandonned for now, too complex to handle DeepExact
    // // @ts-expect-error Incorrect nested property ❌
    // useRegle({ name: { nested: '' } }, () => ({
    //   name: { nested: { required: () => true }, incorrect: { required: () => false } },
    // }));

    // correct schema ✅
    useRegle({ name: { nested: '' } }, { name: { nested: { required: () => true, baguette: () => true } } });

    // -- Collections

    // correct schema ✅
    useRegle({ collection: [{ name: '' }] }, () => ({
      collection: {
        required,
      },
    }));

    // correct schema ✅
    useRegle({ collection: [{ name: '' }] }, () => ({
      collection: {
        required,
        $each: {
          name: { required },
        },
      },
    }));

    // correct schema ✅
    useRegle({ collection: [{ name: '' }] }, () => ({
      collection: {
        required,
        $each: {
          name: { required },
        },
        $deepCompare: true,
      },
    }));

    // @ts-expect-error Incorrect property ❌
    useRegle({ collection: [{ name: '' }] }, () => ({
      collection: {
        required,
        $each: {
          foo: { required },
        },
      },
    }));
  });

  it('inferRules should report wrong types', () => {
    // @ts-expect-error Known rules with inline validator NOT OK ❌
    inferRules({ name: '' }, { name: { required: () => 'foo' } });

    // Known rules with inline validator with no types ✅
    inferRules({ name: '' }, { name: { required: () => true } });

    // Any rule name ✅
    inferRules({ name: '' }, { name: { baguette: () => true } });

    // @ts-expect-error Known rules with invalid inline validator parameter NOT OK ❌
    inferRules({ name: '' }, { name: { required: (_value: string) => true } });

    // @ts-expect-error Incorrect property ❌
    inferRules({ name: '' }, { incorrect: { required: () => true } });

    // TODO Abandonned for now, too complex to handle DeepExact
    // // @ts-expect-error Incorrect property ❌
    // inferRules({ name: '' }, { name: { required: () => true }, incorrect: { required: () => true } });

    // @ts-expect-error Incorrect property ❌
    inferRules({ name: '' }, () => ({ incorrect: { required: () => true } }));

    // TODO Abandonned for now, too complex to handle DeepExact
    // inferRules(
    //   { name: { nested: '' } },
    //   // @ts-expect-error Incorrect nested property ❌
    //   { name: { nested: { required: () => true }, incorrect: { required: () => true } } }
    // );

    // correct schema ✅
    inferRules({ name: { nested: '' } }, { name: { nested: { required: () => true, baguette: () => true } } });
  });

  it('Known rules with inline validator returning metadata ✅', () => {
    const { r$ } = useRegle({ name: '' }, { name: { required2: (_value) => ({ $valid: true, customMeta: 'bar' }) } });
    expectTypeOf(r$.name.$rules.required2.$metadata).toEqualTypeOf<{ customMeta: string }>();
  });

  it('should not error when having a state property named "value"', () => {
    const { r$ } = useRegle({ value: '' }, { value: { required: () => true, email } });

    expectTypeOf(r$.$value.value).toEqualTypeOf<string>();

    const state = ref({ value: '' });
    const { r$: r$1 } = useRegle(state, { value: { required: () => true, email } });
    expectTypeOf(r$1.$value.value).toEqualTypeOf<string>();

    const state2 = ref({ foo: { bar: { value: '' } } });
    const { r$: r$3 } = useRegle(state2, { foo: { bar: { value: { required: () => true, email } } } });
    expectTypeOf(r$3.$value.foo.bar.value).toEqualTypeOf<string>();
  });

  it('should handle unions without discriminating keys', () => {
    type State = ({ name: string } | { address: string }) & { email: string };

    const state = ref<State>({ name: '', address: '', email: '' });
    const { r$ } = useRegle(state, {
      address: { required },
      name: {},
    });

    expectTypeOf(r$.address?.$value).toEqualTypeOf<MaybeOutput<string>>();
    expectTypeOf(r$.name?.$value).toEqualTypeOf<MaybeOutput<string>>();
    expectTypeOf(r$.email?.$value).toEqualTypeOf<MaybeOutput<string>>();

    expectTypeOf(r$.$value).toEqualTypeOf<{
      email: string;
      name?: string;
      address?: string;
    }>();
  });

  it('should handle nested unions without discriminating keys', () => {
    type State = {
      foo: {
        bar: ({ name: string } | { address: string }) & { email?: string };
      };
    };

    const state = ref<State>({ foo: { bar: { name: '', email: '' } } });
    const { r$ } = useRegle(state, { foo: { bar: { name: {}, address: {} } } });

    expectTypeOf(r$.foo.bar.address?.$value).toEqualTypeOf<MaybeOutput<string>>();
    expectTypeOf(r$.foo.bar.name?.$value).toEqualTypeOf<MaybeOutput<string>>();
    expectTypeOf(r$.foo.bar.email?.$value).toEqualTypeOf<MaybeOutput<string>>();

    expectTypeOf(r$.foo.bar.$value).toEqualTypeOf<{
      email?: string | undefined;
      name?: string | undefined;
      address?: string | undefined;
    }>();
  });
});
