import type { Maybe } from '@regle/core';
import { type UnionToTuple } from 'type-fest';
import type { IsUnion } from 'type-fest/source/internal';
import type { EnumLike, z, ZodTypeAny } from 'zod';

// -- Utils

type CatchableMaybe<T> = Maybe<T> | unknown;
type TupleToZodTuple<T extends readonly any[]> = T extends [infer F, ...infer R]
  ? [ZodChild<F>, ...TupleToZodTuple<R>]
  : [];

type TupleToEnum<T extends readonly any[]> = T extends [infer F extends string, ...infer R]
  ? [F, ...TupleToEnum<R>]
  : [];

type TupleToZodDiscrimatedTuple<T extends readonly any[]> = T extends [infer F extends Record<string, any>, ...infer R]
  ? [z.ZodObject<ZodObj<F>>, ...TupleToZodDiscrimatedTuple<R>]
  : [];

type TupleToAnyOrderTuple<T extends readonly any[], V extends readonly any[] = T> = T extends [infer F, ...infer R]
  ? [V[number], ...TupleToAnyOrderTuple<R, T>]
  : [];

type UnionToZodEnum<T> = z.ZodEnum<
  TupleToEnum<UnionToTuple<T>> extends [string, ...string[]] ? TupleToEnum<UnionToTuple<T>> : [string, ...string[]]
>;

type MaybeUnion<TUnion extends EnumLike | unknown, TFix = UnionToTuple<TUnion>[number]> =
  | z.ZodDiscriminatedUnion<
      any,
      TupleToZodDiscrimatedTuple<UnionToTuple<TFix>> extends [z.ZodObject<any>, ...z.ZodObject<any>[]]
        ? TupleToAnyOrderTuple<TupleToZodDiscrimatedTuple<UnionToTuple<TFix>>>
        : [z.ZodDiscriminatedUnionOption<any>, ...z.ZodDiscriminatedUnionOption<any>[]]
    >
  | z.ZodUnion<
      TupleToZodTuple<UnionToTuple<TFix>> extends [ZodTypeAny, ...ZodTypeAny[]]
        ? TupleToAnyOrderTuple<TupleToZodTuple<UnionToTuple<TFix>>>
        : [ZodTypeAny, ...ZodTypeAny[]]
    >
  | UnionToZodEnum<TFix>
  | z.ZodNativeEnum<Record<TFix extends string ? TFix : any, any>>;

// Exports
export type ZodObj<T extends Record<PropertyKey, any>> = {
  [K in keyof Partial<T>]: ZodChild<T[K]>;
};

export type ZodChild<T extends any, TFix = UnionToTuple<T>[number]> = NonNullable<
  IsUnion<NonNullable<TFix>> extends true
    ? MaybeUnion<NonNullable<TFix>>
    : T extends Array<infer A>
      ? z.ZodType<Maybe<z.arrayOutputType<ZodArrayChild<A>>>, any, CatchableMaybe<T>>
      : T extends Date | File
        ? z.ZodType<Maybe<T>, z.ZodTypeDef, CatchableMaybe<T>>
        : T extends Record<string, any>
          ? z.ZodType<Maybe<z.objectOutputType<ZodObj<T>, any>>, any, CatchableMaybe<T>> | z.ZodNativeEnum<T>
          : z.ZodType<Maybe<T>, z.ZodTypeDef, CatchableMaybe<T>>
>;

/** Duplicate to avoid circular references */
type ZodArrayChild<T extends any, TFix = UnionToTuple<T>[number]> = NonNullable<
  IsUnion<NonNullable<TFix>> extends true
    ? MaybeUnion<NonNullable<TFix>>
    : T extends Array<infer A>
      ? z.ZodType<Maybe<z.arrayOutputType<z.ZodType<A>>>, any, CatchableMaybe<T>>
      : T extends Date | File
        ? z.ZodType<Maybe<T>, z.ZodTypeDef, CatchableMaybe<T>>
        : T extends Record<string, any>
          ? z.ZodType<Maybe<z.objectOutputType<ZodObj<T>, any>>, any, CatchableMaybe<T>> | z.ZodNativeEnum<T>
          : z.ZodType<Maybe<T>, z.ZodTypeDef, CatchableMaybe<T>>
>;
export type toZod<T extends Record<PropertyKey, any>> = z.ZodObject<ZodObj<T>>;

// Types

export type PossibleDefTypes =
  | z.ZodDefaultDef
  | z.ZodAnyDef
  | z.ZodMapDef
  | z.ZodSetDef
  | z.ZodEnumDef
  | z.ZodDateDef
  | z.ZodNullDef
  | z.ZodTypeDef
  | z.ZodVoidDef
  | z.ZodArrayDef
  | z.ZodCatchDef
  | z.ZodNeverDef
  | z.ZodTupleDef
  | z.ZodUnionDef
  | z.ZodBigIntDef
  | z.ZodNumberDef
  | z.ZodObjectDef
  | z.ZodRecordDef
  | z.ZodStringDef
  | z.ZodSymbolDef
  | z.ZodBooleanDef
  | z.ZodBrandedDef<any>
  | z.ZodEffectsDef
  | z.ZodLiteralDef
  | z.ZodPromiseDef
  | z.ZodUnknownDef
  | z.ZodFunctionDef
  | z.ZodNullableDef
  | z.ZodOptionalDef
  | z.ZodPipelineDef<any, any>
  | z.ZodReadonlyDef
  | z.ZodNaNDef
  | z.ZodUndefinedDef
  | z.ZodNativeEnumDef
  | z.ZodDiscriminatedUnionDef<any>;
