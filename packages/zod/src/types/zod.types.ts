import type { Maybe } from '@regle/core';
import { type UnionToTuple } from 'type-fest';
import type { IsUnion } from 'type-fest/source/internal';
import type { EnumLike, z, ZodTypeAny } from 'zod';

// -- Utils

type MaybeZodType<T> = z.ZodType<Maybe<T>, any, CatchableMaybe<T>>;

type CatchableMaybe<T> = Maybe<T> | unknown;

// Exports
export type ZodObj<T extends Record<PropertyKey, any>> = {
  [K in keyof Partial<T>]: ZodChild<T[K]>;
};

export type ZodChild<T extends any, TFix = UnionToTuple<T>[number]> = NonNullable<
  IsUnion<NonNullable<TFix>> extends true
    ? MaybeZodType<T>
    : T extends Array<infer A>
      ? MaybeZodType<z.arrayOutputType<ZodArrayChild<A>>>
      : T extends Date | File
        ? MaybeZodType<T>
        : T extends Record<string, any>
          ? MaybeZodType<z.objectOutputType<ZodObj<T>, any>> | /** Enum */ MaybeZodType<T[keyof T]>
          : MaybeZodType<T>
>;

/** Duplicate to avoid circular references */
type ZodArrayChild<T extends any, TFix = UnionToTuple<T>[number]> = NonNullable<
  IsUnion<NonNullable<TFix>> extends true
    ? MaybeZodType<NonNullable<TFix>>
    : T extends Array<infer A>
      ? MaybeZodType<z.arrayOutputType<z.ZodType<A>, any>>
      : T extends Date | File
        ? MaybeZodType<T>
        : T extends Record<string, any>
          ? MaybeZodType<z.objectOutputType<ZodObj<T>, any>> | MaybeZodType<T>
          : MaybeZodType<T>
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
