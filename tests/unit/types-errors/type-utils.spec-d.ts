import {
  useRegle,
  type InferRegleRoot,
  type JoinDiscriminatedUnions,
  type RegleFieldStatus,
  type RegleRoot,
  type RegleRuleDefinition,
  type RegleShortcutDefinition,
  type RegleStatus,
} from '@regle/core';
import { email, minLength, required } from '@regle/rules';
import { useRegleSchema, type RegleSchemaFieldStatus } from '@regle/schemas';
import { ref } from 'vue';
import { z } from 'zod/v3';

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

    // oxlint-disable-next-line
    const foo: RegleStatus<Record<string, any> | undefined> = r$.nested;
    // oxlint-disable-next-line
    const bar: RegleStatus<Record<string, any> | undefined> = r$.nested;
  });

  it('should correctly infer custom function types', () => {
    type FormComposable = {
      r$?: RegleRoot<Record<string, unknown>, any>;
    };

    const useForm = ({ r$ }: FormComposable = {}) => {
      const isFieldInvalid = (fieldName: string): boolean => {
        const fields = r$?.$fields;
        const fieldValidation = fields?.[fieldName as keyof typeof fields];

        return !!fieldValidation?.$invalid;
      };

      return {
        isFieldInvalid,
      };
    };

    type Form = {
      name: string | null;
      email: string | null;
      address: {
        street: string | null;
      };
    };

    const form = ref<Form>({
      name: '',
      email: '',
      address: {
        street: '',
      },
    });

    const { r$ } = useRegle(form, {
      name: { required, minLength: minLength(4) },
      email: { email },
      address: {
        street: {
          required,
        },
      },
    });

    useForm({ r$ });
  });
});
