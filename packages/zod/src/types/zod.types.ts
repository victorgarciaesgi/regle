import type { Maybe } from '@regle/core';
import type { z, ZodType, ZodTypeAny } from 'zod';

type CatchableMaybe<T> = Maybe<T> | unknown;

export type ZodObj<T extends Record<PropertyKey, any>> = {
  [K in keyof Partial<T>]: ZodChild<T[K]>;
};

export type ZodChild<T extends any> = NonNullable<
  T extends Array<infer A>
    ? z.ZodType<CatchableMaybe<z.arrayOutputType<ZodArrayChild<A>>>, any>
    : T extends Date | File
      ? z.ZodType<CatchableMaybe<T>, z.ZodTypeDef, CatchableMaybe<T>>
      : T extends Record<string, any>
        ? z.ZodType<CatchableMaybe<z.objectOutputType<ZodObj<T>, any>>>
        : z.ZodType<CatchableMaybe<T>, z.ZodTypeDef, CatchableMaybe<T>>
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
  | z.ZodNativeEnumDef;
