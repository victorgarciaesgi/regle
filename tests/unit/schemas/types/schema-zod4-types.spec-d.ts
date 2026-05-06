import type { RegleShortcutDefinition } from '@regle/core';
import { useRegleSchema, type RegleSchemaCollectionStatus, type RegleSchemaFieldStatus } from '@regle/schemas';
import { ref } from 'vue';
import { z } from 'zod/v4';

it('zod - intersection types should correctly infer types', () => {
  const schema = z
    .object({ name: z.string() })
    .and(z.object({ count: z.number() }))
    .and(z.object({ email: z.string() }));

  const { r$ } = useRegleSchema({} as z.infer<typeof schema>, schema);

  expectTypeOf(r$.count).toEqualTypeOf<RegleSchemaFieldStatus<number, number, RegleShortcutDefinition<any>>>();
  expectTypeOf(r$.name).toEqualTypeOf<RegleSchemaFieldStatus<string, string, RegleShortcutDefinition<any>>>();
  expectTypeOf(r$.email).toEqualTypeOf<RegleSchemaFieldStatus<string, string, RegleShortcutDefinition<any>>>();
});

it('zod - collections should have the correct type', () => {
  const grandChildSchema = z.object({
    foo: z.string(),
  });

  const childSchema = z.object({
    id: z.string(),
    name: z.string(),
    address: z.string(),
    job: z.string(),
    grandChildren: z.array(grandChildSchema),
  });
  const schema = z.object({
    collection: z.array(childSchema),
    test: z.string(),
  });

  const { r$ } = useRegleSchema({} as Partial<z.infer<typeof schema>>, schema);

  expectTypeOf(r$.collection).toEqualTypeOf<
    RegleSchemaCollectionStatus<
      z.infer<typeof childSchema>[],
      z.infer<typeof childSchema>[],
      RegleShortcutDefinition<any>
    >
  >();

  expectTypeOf(r$.collection?.$each[0].grandChildren).toEqualTypeOf<
    RegleSchemaCollectionStatus<
      z.infer<typeof grandChildSchema>[],
      z.infer<typeof grandChildSchema>[],
      RegleShortcutDefinition<any>
    >
  >();
});

it('zod - branded schema outputs should be preserved in schema state', async () => {
  const emailIdSchema = z.number().brand<'emailId'>();
  const emailSchema = z.object({
    id: emailIdSchema,
    label: z.string(),
  });
  const schema = z.object({
    email: emailSchema.nullable().transform((val) => val!),
  });

  type OutputEmail = z.output<typeof emailSchema>;

  const state = ref<z.input<typeof schema>>({ email: null });
  const { r$ } = useRegleSchema(state, schema);

  // Input value
  expectTypeOf(r$.$value.email?.id).toEqualTypeOf<number | undefined>();
  // Output value
  expectTypeOf(r$.email.id.$output).branded.toEqualTypeOf<OutputEmail['id']>();

  const { valid, data } = await r$.$validate();

  if (valid) {
    const emailId = data.email.id;
    expectTypeOf(emailId).toEqualTypeOf<OutputEmail['id']>();
    const emailLabel = data.email.label;
    expectTypeOf(emailLabel).toEqualTypeOf<OutputEmail['label']>();
  }
});
