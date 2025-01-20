import type * as v from 'valibot';
import type { MaybeSchemaAsync } from '../types';

export function isIntersectSchema(
  schema: MaybeSchemaAsync<unknown>
): schema is v.IntersectSchema<v.IntersectOptions, any> {
  return schema.type === 'intersect';
}

export function isObjectSchema(
  schema: MaybeSchemaAsync<unknown>
): schema is v.ObjectSchema<v.ObjectEntries, undefined> {
  return schema.type === 'object';
}

export function isWrappedType(schema: MaybeSchemaAsync<unknown>): schema is v.BaseSchema<
  unknown,
  unknown,
  v.BaseIssue<unknown>
> & {
  wrapped: MaybeSchemaAsync<unknown>;
} {
  return 'wrapped' in schema;
}
