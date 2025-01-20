import type { RegleShortcutDefinition } from '@regle/core';
import { useRegleSchema, type RegleSchemaCollectionStatus, type RegleSchemaFieldStatus } from '@regle/schemas';
import { z } from 'zod';

it('zod intersection types should correctly infer types', () => {
  const schema = z
    .object({ name: z.string() })
    .and(z.object({ count: z.number() }))
    .and(z.object({ email: z.string() }));

  const { r$ } = useRegleSchema({} as z.infer<typeof schema>, schema);

  expectTypeOf(r$.$fields.count).toEqualTypeOf<RegleSchemaFieldStatus<number, number, RegleShortcutDefinition<any>>>();
  expectTypeOf(r$.$fields.name).toEqualTypeOf<RegleSchemaFieldStatus<string, string, RegleShortcutDefinition<any>>>();
  expectTypeOf(r$.$fields.email).toEqualTypeOf<RegleSchemaFieldStatus<string, string, RegleShortcutDefinition<any>>>();
});

it('zod collections should have the correct type', () => {
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

  expectTypeOf(r$.$fields.collection).toEqualTypeOf<
    RegleSchemaCollectionStatus<
      z.infer<typeof childSchema>,
      z.infer<typeof childSchema>[] | [],
      RegleShortcutDefinition<any>
    >
  >;

  expectTypeOf(r$.$fields.collection?.$each[0].$fields.grandChildren).toEqualTypeOf<
    RegleSchemaCollectionStatus<
      z.infer<typeof grandChildSchema>,
      z.infer<typeof grandChildSchema>[],
      RegleShortcutDefinition<any>
    >
  >;
});
