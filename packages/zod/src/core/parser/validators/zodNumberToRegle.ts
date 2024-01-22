import { RegleFormPropertyType } from '@regle/core';
import { withMessage } from '@regle/validators';
import { z } from 'zod';
import { extractIssuesMessages, transformZodValidatorAdapter } from './shared';

export function zodNumberToRegle(
  def: z.ZodNumberDef,
  schema: z.ZodSchema<any>
): RegleFormPropertyType {
  if (def.checks.length) {
    return Object.fromEntries(
      def.checks.map((check) => {
        return [
          check.kind,
          withMessage(transformZodValidatorAdapter(schema), extractIssuesMessages(schema, check)),
        ];
      })
    );
  } else {
    const message = extractIssuesMessages(schema);
    return {
      number: withMessage(transformZodValidatorAdapter(schema), message),
    };
  }
}
