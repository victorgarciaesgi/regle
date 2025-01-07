import type { Maybe } from '@regle/core';
import type { IsUnion } from 'type-fest/source/internal';
import { type UnionToTuple } from 'type-fest';
import type { z, ZodRawShape, ZodType, ZodTypeAny } from 'zod';

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

type UnionToZodEnum<T> = z.ZodEnum<
  TupleToEnum<UnionToTuple<T>> extends [string, ...string[]] ? TupleToEnum<UnionToTuple<T>> : [string, ...string[]]
>;

type MaybeUnion<T> =
  | z.ZodUnion<
      TupleToZodTuple<UnionToTuple<T>> extends [ZodTypeAny, ...ZodTypeAny[]]
        ? TupleToZodTuple<UnionToTuple<T>>
        : [ZodTypeAny, ...ZodTypeAny[]]
    >
  | z.ZodDiscriminatedUnion<
      any,
      TupleToZodDiscrimatedTuple<UnionToTuple<T>> extends [z.ZodObject<any>, ...z.ZodObject<any>[]]
        ? TupleToZodDiscrimatedTuple<UnionToTuple<T>>
        : [z.ZodDiscriminatedUnionOption<any>, ...z.ZodDiscriminatedUnionOption<any>[]]
    >
  | UnionToZodEnum<T>
  | undefined;

// Exports

export type ZodObj<T extends Record<PropertyKey, any>> = {
  [K in keyof Partial<T>]: ZodChild<T[K]>;
};

export type ZodChild<T extends any> = NonNullable<
  IsUnion<NonNullable<T>> extends true
    ? MaybeUnion<NonNullable<T>>
    : T extends Array<infer A>
      ? z.ZodType<Maybe<z.arrayOutputType<ZodArrayChild<A>>>, any, CatchableMaybe<T>>
      : T extends Date | File
        ? z.ZodType<Maybe<T>, z.ZodTypeDef, CatchableMaybe<T>>
        : T extends Record<string, any>
          ? z.ZodType<Maybe<z.objectOutputType<ZodObj<T>, any>>, any, CatchableMaybe<T>>
          : z.ZodType<Maybe<T>, z.ZodTypeDef, CatchableMaybe<T>>
>;

/** Duplicate to avoid circular references */
type ZodArrayChild<T> =
  T extends Array<infer A>
    ? z.ZodType<CatchableMaybe<z.arrayOutputType<z.ZodType<A>>>, any>
    : T extends Date | File
      ? z.ZodType<CatchableMaybe<T>, z.ZodTypeDef, CatchableMaybe<T>>
      : T extends Record<string, any>
        ? z.ZodType<CatchableMaybe<z.objectOutputType<ZodObj<T>, any>>>
        : z.ZodType<CatchableMaybe<T>, z.ZodTypeDef, CatchableMaybe<T>>;
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
