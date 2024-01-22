import { RegleFormPropertyType, RegleRuleDefinition } from '@regle/core';
import { withMessage } from '@regle/validators';
import { z } from 'zod';
import { extractIssuesMessages, transformZodValidatorAdapter } from './shared';

export function zodStringtoRegle(
  def: z.ZodStringDef,
  schema: z.ZodSchema<any>
): RegleFormPropertyType {
  if (def.checks.length) {
    return Object.fromEntries(
      def.checks.map((check) => {
        const message = extractIssuesMessages(schema, check);
        const validatorKey = check.kind;

        return [validatorKey, withMessage(transformZodValidatorAdapter(schema), message)];
      })
    );
  } else {
    const checkShapeValidator = z.string();
    const message = extractIssuesMessages(schema);
    return {
      string: withMessage(transformZodValidatorAdapter(checkShapeValidator), message),
    };
  }
}
