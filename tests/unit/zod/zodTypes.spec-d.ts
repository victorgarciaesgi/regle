import type { RegleShortcutDefinition } from '@regle/core';
import { useZodRegle, type ZodRegleCollectionStatus, type ZodRegleFieldStatus } from '@regle/zod';
import { z } from 'zod';

it('zod intersection types should correctly infer types', () => {
  const schema = z
    .object({ name: z.string() })
    .and(z.object({ count: z.number() }))
    .and(z.object({ email: z.string() }));

  const { r$ } = useZodRegle({} as z.infer<typeof schema>, schema);

  expectTypeOf(r$.$fields.count).toEqualTypeOf<
    ZodRegleFieldStatus<z.ZodNumber, number, RegleShortcutDefinition<any>>
  >();
  expectTypeOf(r$.$fields.name).toEqualTypeOf<ZodRegleFieldStatus<z.ZodString, string, RegleShortcutDefinition<any>>>();
  expectTypeOf(r$.$fields.email).toEqualTypeOf<
    ZodRegleFieldStatus<z.ZodString, string, RegleShortcutDefinition<any>>
  >();
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
  });

  const { r$ } = useZodRegle({} as z.infer<typeof schema>, schema);

  expectTypeOf(r$.$fields.collection).toEqualTypeOf<
    ZodRegleCollectionStatus<typeof childSchema, z.infer<typeof childSchema>[], RegleShortcutDefinition<any>>
  >;

  expectTypeOf(r$.$fields.collection.$each[0].$fields.grandChildren).toEqualTypeOf<
    ZodRegleCollectionStatus<typeof grandChildSchema, z.infer<typeof grandChildSchema>[], RegleShortcutDefinition<any>>
  >;
});
