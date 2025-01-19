import type { RegleShortcutDefinition } from '@regle/core';
import { useValibotRegle, type ValibotRegleFieldStatus } from '@regle/valibot';
import * as v from 'valibot';

it('valibot intersection types should correctly infer types', () => {
  const schema = v.intersect([
    v.object({ name: v.string() }),
    v.object({ count: v.number() }),
    v.object({ email: v.string() }),
  ]);

  const { r$ } = useValibotRegle({} as v.InferInput<typeof schema>, schema);

  expectTypeOf(r$.$fields.count).toEqualTypeOf<ValibotRegleFieldStatus<number, number, RegleShortcutDefinition<any>>>();
  expectTypeOf(r$.$fields.name).toEqualTypeOf<ValibotRegleFieldStatus<string, string, RegleShortcutDefinition<any>>>();
  expectTypeOf(r$.$fields.email).toEqualTypeOf<ValibotRegleFieldStatus<string, string, RegleShortcutDefinition<any>>>();
});
