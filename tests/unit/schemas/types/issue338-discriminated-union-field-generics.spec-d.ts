import type { MaybeSchemaVariantStatus, RegleSchemaFieldStatus } from '@regle/schemas';
import { useRegleSchema } from '@regle/schemas';
import { z } from 'zod/v4';

/**
 * Regression for helpers that pair option lists with a nullable transformed discriminated-union field:
 * `r$.email` is a variant status, not only `RegleSchemaFieldStatus`, so the field parameter must allow both.
 */
it('generic field helper accepts RegleSchemaFieldStatus<T | null> | MaybeSchemaVariantStatus<T>', () => {
  const emailSchema = z.discriminatedUnion('id', [
    z.object({
      id: z.literal(1),
      label: z.literal('private'),
    }),
    z.object({
      id: z.literal(2),
      label: z.literal('business'),
    }),
  ]);

  type Email = z.infer<typeof emailSchema>;

  const emailOptions: Email[] = [
    { id: 1, label: 'private' },
    { id: 2, label: 'business' },
  ];

  const formSchema = z.object({
    email: emailSchema.nullable().transform((val) => val!),
  });

  const { r$ } = useRegleSchema({ email: null }, formSchema);

  function handleEmail<T extends Record<string, unknown>>(
    options: T[],
    field: RegleSchemaFieldStatus<T | null> | MaybeSchemaVariantStatus<T>
  ) {
    return { options, field };
  }

  handleEmail(emailOptions, r$.email);

  function fieldOnly<T extends Record<string, unknown>>(_options: T[], _field: RegleSchemaFieldStatus<T | null>) {}

  // `r$.email` is a variant root for this discriminated union, not a plain field status.
  // @ts-expect-error Argument of type ... is not assignable to parameter of type 'RegleSchemaFieldStatus<...'
  fieldOnly(emailOptions, r$.email);
});
