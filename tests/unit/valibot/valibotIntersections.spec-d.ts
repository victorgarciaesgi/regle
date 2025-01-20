import type { RegleShortcutDefinition } from '@regle/core';
import { useRegleSchema, type RegleSchemaFieldStatus } from '@regle/schemas';
import * as v from 'valibot';

it('valibot intersection types should correctly infer types', () => {
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
