import type { RegleShortcutDefinition } from '@regle/core';
import { useRegleSchema, type RegleSchemaCollectionStatus, type RegleSchemaFieldStatus } from '@regle/schemas';
import * as v from 'valibot';

it('valibot - intersection types should correctly infer types', () => {
  const schema = v.intersect([
    v.object({ name: v.string() }),
    v.object({ count: v.number() }),
    v.object({ email: v.string() }),
  ]);

  const { r$ } = useRegleSchema({} as v.InferInput<typeof schema>, schema);

  expectTypeOf(r$.$fields.count).toEqualTypeOf<RegleSchemaFieldStatus<number, number, RegleShortcutDefinition<any>>>();
  expectTypeOf(r$.$fields.name).toEqualTypeOf<RegleSchemaFieldStatus<string, string, RegleShortcutDefinition<any>>>();
  expectTypeOf(r$.$fields.email).toEqualTypeOf<RegleSchemaFieldStatus<string, string, RegleShortcutDefinition<any>>>();
});

it('valibot - collections should have the correct type', () => {
  const grandChildSchema = v.object({
    foo: v.string(),
  });

  const childSchema = v.object({
    id: v.string(),
    name: v.string(),
    address: v.string(),
    job: v.string(),
    grandChildren: v.array(grandChildSchema),
  });
  const schema = v.object({
    collection: v.array(childSchema),
    test: v.string(),
  });

  const { r$ } = useRegleSchema({} as Partial<v.InferInput<typeof schema>>, schema);

  expectTypeOf(r$.$fields.collection).toEqualTypeOf<
    RegleSchemaCollectionStatus<
      v.InferInput<typeof childSchema>,
      v.InferInput<typeof childSchema>[] | [],
      RegleShortcutDefinition<any>
    >
  >;

  expectTypeOf(r$.$fields.collection.$each[0].$fields.grandChildren).toEqualTypeOf<
    RegleSchemaCollectionStatus<
      v.InferInput<typeof grandChildSchema>,
      v.InferInput<typeof grandChildSchema>[],
      RegleShortcutDefinition<any>
    >
  >;
});
