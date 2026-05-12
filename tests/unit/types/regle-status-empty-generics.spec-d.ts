import type { RegleCommonStatus, RegleStatus } from '@regle/core';
import type { RegleSchemaStatus } from '@regle/schemas';
import { expectTypeOf } from 'vitest';

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

  expectTypeOf(r$.$fields.email).toExtend<RegleCommonStatus<unknown, unknown> | undefined>();

  // @ts-expect-error - email is not a property of RegleSchemaStatus
  assertType(r$['email']);
});
