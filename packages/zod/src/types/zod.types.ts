import type { Maybe } from '@regle/core';
import type { z } from 'zod';

export type ZodObj<T extends Record<PropertyKey, any>> = {
  [K in keyof T]: ZodChild<T[K]>;
};

export type ZodChild<T extends any> = NonNullable<
  T extends Array<infer A>
    ? z.ZodArray<ZodChild<A>>
    : T extends Date | File
      ? z.ZodType<Maybe<T>, z.ZodTypeDef, Maybe<T>>
      : T extends Record<string, any>
        ? z.ZodObject<ZodObj<T>>
        : z.ZodType<Maybe<T>, z.ZodTypeDef, Maybe<T>>
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
  | z.ZodNativeEnumDef;
