import type { RegleShortcutDefinition } from '@regle/core';
import { useZodRegle, type ZodRegleFieldStatus } from '@regle/zod';
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
