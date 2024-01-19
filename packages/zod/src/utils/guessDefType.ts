import { InlineRuleDeclaration, Maybe, RegleFormPropertyType } from '@regle/core';
import { withMessage } from '@regle/validators';
import z from 'zod';

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

export function processZodTypeDef(
  def: PossibleDefTypes
): Record<PropertyKey, RegleFormPropertyType<any, any>> {
  if (def && typeof def === 'object' && 'typeName' in def) {
    if (def.typeName === z.ZodFirstPartyTypeKind.ZodAny) {
      //
      return {};
    } else if (def.typeName === z.ZodFirstPartyTypeKind.ZodArray) {
      return {};
    } else if (def.typeName === z.ZodFirstPartyTypeKind.ZodString) {
      return Object.fromEntries(
        def.checks.map((check) => {
          if ('value' in check) {
            // validators with simple parameter

            if ('position' in check) {
              // includes
              return [check.kind, () => {}];
            } else {
              const checkShapeValidator = z.string()[check.kind](check.value as unknown as never);
              const regleValidator = (value: unknown) =>
                checkShapeValidator.safeParse(value).success;
              return [check.kind, withMessage(regleValidator, check.message ?? 'Error')];
            }
          } else if ('precision' in check && 'offset' in check) {
            // datetime
            return [check.kind, () => {}];
          } else if ('regex' in check) {
            return [check.kind, () => {}];
          } else if ('version' in check) {
            // ip
            return [check.kind, () => {}];
          } else {
            const checkShapeValidator = z.string()[check.kind]();
            const regleValidator = (value: unknown) => checkShapeValidator.safeParse(value).success;
            return [check.kind, withMessage(regleValidator, check.message ?? 'Error')];
          }
        })
      );
    }
  }

  return {};
}
