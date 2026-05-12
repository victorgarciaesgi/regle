import type { RegleCommonStatus, RegleStatus } from '@regle/core';
import type { RegleSchemaCommonStatus, RegleSchemaStatus } from '@regle/schemas';
import { expectTypeOf } from 'vitest';
import { ref, provide, type InjectionKey } from 'vue';
import { useRegleSchema } from '@regle/schemas';
import * as v from 'valibot';

/**
 * With default (widened) generics, `$fields` keeps a string index fallback so
 * deeply unknown shapes stay usable, while root-level field shortcuts are not
 * inferred from `Record<string, any>` alone.
 */
it('RegleStatus default generics: unknown keys via $fields only', () => {
  const r$: RegleStatus = {} as any;

  expectTypeOf(r$.$fields.email).toExtend<RegleCommonStatus<unknown, unknown, Record<string, any>> | undefined>();

  // @ts-expect-error - email is not a property of RegleStatus
  assertType(r$['email']);
});

it('RegleSchemaStatus default generics: unknown keys via $fields only', () => {
  const r$: RegleSchemaStatus = {} as any;

  expectTypeOf(r$.$fields.email).toExtend<RegleSchemaCommonStatus<unknown, unknown> | undefined>();

  // @ts-expect-error - email is not a property of RegleSchemaStatus
  assertType(r$['email']);
});

it('Any Regle Schema can be assignable to a RegleSchemaStatus', () => {
  const key = Symbol() as InjectionKey<RegleSchemaStatus>;

  const state = ref({ name: 'asd' });
  const schema = v.object({
    name: v.pipe(v.string(), v.minLength(3)),
  });
  const { r$ } = useRegleSchema(state, schema);

  // Expect no error
  provide(key, r$);
});
