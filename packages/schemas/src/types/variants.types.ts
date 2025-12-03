import type { HasNamedKeys, RegleShortcutDefinition, TupleToPlainObj } from '@regle/core';
import type { IsUnion, UnionToTuple } from 'type-fest';
import type { InferRegleSchemaStatusType, RegleSchemaStatus } from './core.types';
import type { StandardSchemaV1 } from '@standard-schema/spec';

export type MaybeSchemaVariantStatus<
  TState extends Record<string, any> | undefined = Record<string, any>,
  TSchema extends StandardSchemaV1 = StandardSchemaV1,
  TShortcuts extends RegleShortcutDefinition = {},
  TRoot extends boolean = false,
> =
  IsUnion<NonNullable<TState>> extends true
    ? Omit<RegleSchemaStatus<TState, TSchema, TShortcuts, TRoot>, '$fields'> & {
        $fields: ProcessChildrenFields<TState, TShortcuts>[keyof ProcessChildrenFields<TState, TShortcuts>];
      } & (HasNamedKeys<TState> extends true
          ? ProcessChildrenFields<TState, TShortcuts>[keyof ProcessChildrenFields<TState, TShortcuts>]
          : {})
    : RegleSchemaStatus<TState, TSchema, TShortcuts, TRoot>;

type ProcessChildrenFields<
  TState extends Record<string, any> | undefined,
  TShortcuts extends RegleShortcutDefinition = {},
> = {
  [TIndex in keyof TupleToPlainObj<UnionToTuple<TState>>]: TIndex extends `${infer TIndexInt extends number}`
    ? {
        // Defined keys
        [TKey in keyof UnionToTuple<TState>[TIndexInt] as NonNullable<
          UnionToTuple<TState>[TIndexInt]
        >[TKey] extends UnionToTuple<TState>[TIndexInt][TKey]
          ? TKey
          : never]-?: InferRegleSchemaStatusType<NonNullable<UnionToTuple<TState>[TIndexInt]>[TKey], TShortcuts>;
      } & {
        // Maybe undefined keys
        [TKey in keyof UnionToTuple<TState>[TIndexInt] as NonNullable<
          UnionToTuple<TState>[TIndexInt]
        >[TKey] extends UnionToTuple<TState>[TIndexInt][TKey]
          ? never
          : TKey]?: InferRegleSchemaStatusType<NonNullable<UnionToTuple<TState>[TIndexInt]>[TKey], TShortcuts>;
      }
    : {};
};
