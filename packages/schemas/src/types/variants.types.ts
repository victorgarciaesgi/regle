import type { HasNamedKeys, RegleShortcutDefinition, TupleToPlainObj } from '@regle/core';
import type { IsUnion, UnionToTuple } from 'type-fest';
import type { InferRegleSchemaStatusType, RegleSchemaStatus } from './core.types';
import type { StandardSchemaV1 } from '@standard-schema/spec';

export type MaybeSchemaVariantStatus<
  TInput extends Record<string, any> | undefined = Record<string, any>,
  TOutput extends Record<string, any> | undefined = TInput,
  TSchema extends StandardSchemaV1 = StandardSchemaV1,
  TShortcuts extends RegleShortcutDefinition = {},
  TRoot extends boolean = false,
> =
  IsUnion<NonNullable<TInput>> extends true
    ? Omit<RegleSchemaStatus<TInput, TOutput, TSchema, TShortcuts, TRoot>, '$fields'> & {
        $fields: ProcessChildrenFields<TInput, TOutput, TShortcuts>[keyof ProcessChildrenFields<
          TInput,
          TOutput,
          TShortcuts
        >];
      } & (HasNamedKeys<TInput> extends true
          ? ProcessChildrenFields<TInput, TOutput, TShortcuts>[keyof ProcessChildrenFields<TInput, TOutput, TShortcuts>]
          : {})
    : RegleSchemaStatus<TInput, TOutput, TSchema, TShortcuts, TRoot>;

type ProcessChildrenFields<
  TInput extends Record<string, any> | undefined,
  TOutput = TInput,
  TShortcuts extends RegleShortcutDefinition = {},
> = {
  [TIndex in keyof TupleToPlainObj<UnionToTuple<TInput>>]: TIndex extends `${infer TIndexInt extends number}`
    ? {
        // Defined keys
        [TKey in keyof UnionToTuple<TInput>[TIndexInt] as NonNullable<
          UnionToTuple<TInput>[TIndexInt]
        >[TKey] extends UnionToTuple<TInput>[TIndexInt][TKey]
          ? TKey
          : never]-?: InferRegleSchemaStatusType<
          NonNullable<UnionToTuple<TInput>[TIndexInt]>[TKey],
          NonNullable<UnionToTuple<TOutput>[TIndexInt]>[TKey],
          TShortcuts
        >;
      } & {
        // Maybe undefined keys
        [TKey in keyof UnionToTuple<TInput>[TIndexInt] as NonNullable<
          UnionToTuple<TInput>[TIndexInt]
        >[TKey] extends UnionToTuple<TInput>[TIndexInt][TKey]
          ? never
          : TKey]?: InferRegleSchemaStatusType<
          NonNullable<UnionToTuple<TInput>[TIndexInt]>[TKey],
          NonNullable<UnionToTuple<TOutput>[TIndexInt]>[TKey],
          TShortcuts
        >;
      }
    : {};
};
