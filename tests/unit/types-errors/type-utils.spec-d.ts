import type { RegleComputedRules } from '@regle/core';
import {
  defineRegleConfig,
  inferRules,
  useRegle,
  type InferRegleRoot,
  type JoinDiscriminatedUnions,
  type RegleFieldStatus,
  type RegleRoot,
  type RegleRuleDefinition,
  type RegleShortcutDefinition,
  type RegleStatus,
} from '@regle/core';
import { email, minLength, required, withMessage } from '@regle/rules';
import { useRegleSchema, type RegleSchemaFieldStatus } from '@regle/schemas';
import type { Ref } from 'vue';
import { computed, ref, type ComputedRef } from 'vue';
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

  it('should handle unions without discriminating keys', () => {
    type Union =
      | { firstName: string; address: { street: string } }
      | { firstName: number; lastName: string }
      | { type?: undefined };

    type DumbUnion = JoinDiscriminatedUnions<Union>;

    expectTypeOf<DumbUnion>().toEqualTypeOf<{
      type?: undefined;
      firstName?: string | number | undefined;
      lastName?: string | undefined;
      address?:
        | {
            street: string;
          }
        | undefined;
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
      RegleSchemaFieldStatus<string, RegleShortcutDefinition<any>>
    >();
    expectTypeOf<r$Schema['email']>().toEqualTypeOf<RegleSchemaFieldStatus<string, RegleShortcutDefinition<any>>>();

    const { r$ } = useRegle({ nested: { name: '' } }, { nested: { name: { required } } });

    // oxlint-disable-next-line
    const foo: RegleStatus<Record<string, any> | undefined> = r$.nested;
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

export type LegalFormDetails = {
  legalEntityId?: string;
};

export type LegalFormPreferences = {
  clientTerms?: File | null;
  legalEntityId?: string;
};

export type LegalFormAffiliation = {
  clientTeams: Set<string>;
  legalEntityId?: string;
};

export type LegalEntityForm = {
  legalEntityId?: string;
  organizationId: string;
  details: LegalFormDetails;
  preferences: LegalFormPreferences;
  affiliation: LegalFormAffiliation;
};

describe('type utils - misc', () => {
  it('RegleComputedRules should correctly infer the rules type', () => {
    const form = ref({ name: '', foo: '', nested: { name: '', foo: '' } });

    function useMyRules(): ComputedRef<RegleComputedRules<typeof form>> {
      return computed(() => ({ name: { required }, nested: { name: { required } } }));
    }

    useRegle(form, useMyRules());
  });

  it('MaybeGetter should correctly infer the getter type', () => {
    const form: Ref<{ name: string }> | undefined = ref({ name: '' });

    const rules = computed(() => inferRules(form, { name: { required } }));

    useRegle(form, rules);
  });

  it('should work with nested forms', () => {
    const { useRegle: useCustomRegle } = defineRegleConfig({
      rules: () => ({
        required: withMessage(required, 'Custom rule'),
        customRule: withMessage(required, 'Custom rule'),
      }),
    });
    const form: Ref<LegalEntityForm> | undefined = ref({} as any);

    const rules: ComputedRef<RegleComputedRules<LegalEntityForm>> = computed(() => ({
      legalEntityId: { required },
      organizationId: { required },
      preferences: {
        clientTerms: { required },
      },
    }));

    useCustomRegle(form, rules);
  });
});
