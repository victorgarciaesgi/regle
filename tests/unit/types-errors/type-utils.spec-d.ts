import {
  useRegle,
  type InferRegleRoot,
  type JoinDiscriminatedUnions,
  type RegleFieldStatus,
  type RegleRuleDefinition,
  type RegleShortcutDefinition,
  type RegleStatus,
} from '@regle/core';
import { email, required } from '@regle/rules';
import { useRegleSchema, type RegleSchemaFieldStatus } from '@regle/schemas';
import { z } from 'zod';

describe('type utils', () => {
  it('JoinDiscriminatedUnions should bind unions correclty', () => {
    type Union = { name: string } & (
      | { type: 'ONE'; firstName: string }
      | { type: 'TWO'; firstName: number; lastName: string }
      | { type?: undefined }
    );

    expectTypeOf<JoinDiscriminatedUnions<Union>>().toEqualTypeOf<{
      name: string;
      type?: 'ONE' | 'TWO' | undefined;
      firstName?: string | number | undefined;
      lastName?: string | undefined;
    }>();
  });

  it('InferRegleRoot should work correctly', () => {
    function useMyForm() {
      return useRegle(
        { email: '' },
        {
          email: { email: email },
        }
      );
    }

    function useMyFormSchema() {
      return useRegleSchema({ email: '' }, z.object({ email: z.string().email() }));
    }

    type r$ = InferRegleRoot<typeof useMyForm>;

    expectTypeOf<r$['$fields']['email']>().toEqualTypeOf<
      RegleFieldStatus<
        string,
        {
          email: RegleRuleDefinition<string, [], false, boolean, string>;
        },
        RegleShortcutDefinition<any>
      >
    >();
    expectTypeOf<r$['email']>().toEqualTypeOf<
      RegleFieldStatus<
        string,
        {
          email: RegleRuleDefinition<string, [], false, boolean, string>;
        },
        RegleShortcutDefinition<any>
      >
    >();

    type r$Schema = InferRegleRoot<typeof useMyFormSchema>;

    expectTypeOf<r$Schema['$fields']['email']>().toEqualTypeOf<
      RegleSchemaFieldStatus<string, string, RegleShortcutDefinition<any>>
    >();
    expectTypeOf<r$Schema['email']>().toEqualTypeOf<
      RegleSchemaFieldStatus<string, string, RegleShortcutDefinition<any>>
    >();

    const { r$ } = useRegle({ nested: { name: '' } }, { nested: { name: { required } } });

    const foo: RegleStatus<Record<string, any> | undefined> = r$.nested;
    const bar: RegleStatus<Record<string, any> | undefined> = r$.nested;
  });
});
