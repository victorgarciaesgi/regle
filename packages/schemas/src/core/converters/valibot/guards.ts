import type * as v from 'valibot';
import type { MaybeSchemaAsync } from '../../../types/valibot/valibot.schema.types';

export function isIntersectSchema(
  schema: MaybeSchemaAsync<unknown> | v.SchemaWithPipe<any>
): schema is v.IntersectSchema<v.IntersectOptions, any> {
  return schema.type === 'intersect';
}

export function isObjectSchema(
  schema: MaybeSchemaAsync<unknown> | v.SchemaWithPipe<any>
): schema is v.ObjectSchema<v.ObjectEntries, undefined> {
  return schema.type === 'object';
}

export function isPipeSchema(
  schema: MaybeSchemaAsync<unknown> | v.SchemaWithPipe<any>
): schema is v.SchemaWithPipe<
  [v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>, ...v.PipeItem<any, unknown, v.BaseIssue<unknown>>[]]
> {
  return 'pipe' in schema;
}

export function isWrappedType(schema: MaybeSchemaAsync<unknown> | v.SchemaWithPipe<any>): schema is v.BaseSchema<
  unknown,
  unknown,
  v.BaseIssue<unknown>
> & {
  wrapped: MaybeSchemaAsync<unknown>;
} {
  return 'wrapped' in schema;
}
