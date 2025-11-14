import type { RegleShortcutDefinition } from '@regle/core';
import { useRegleSchema, type RegleSchemaCollectionStatus, type RegleSchemaFieldStatus } from '@regle/schemas';
import { z } from 'zod/v4';

it('zod - intersection types should correctly infer types', () => {
  const schema = z
    .object({ name: z.string() })
    .and(z.object({ count: z.number() }))
    .and(z.object({ email: z.string() }));

  const { r$ } = useRegleSchema({} as z.infer<typeof schema>, schema);

  expectTypeOf(r$.count).toEqualTypeOf<RegleSchemaFieldStatus<number, RegleShortcutDefinition<any>>>();
  expectTypeOf(r$.name).toEqualTypeOf<RegleSchemaFieldStatus<string, RegleShortcutDefinition<any>>>();
  expectTypeOf(r$.email).toEqualTypeOf<RegleSchemaFieldStatus<string, RegleShortcutDefinition<any>>>();
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
    RegleSchemaCollectionStatus<z.infer<typeof childSchema>[], RegleShortcutDefinition<any>>
  >;

  expectTypeOf(r$.collection?.$each[0].grandChildren).toEqualTypeOf<
    RegleSchemaCollectionStatus<z.infer<typeof grandChildSchema>[], RegleShortcutDefinition<any>>
  >;
});
