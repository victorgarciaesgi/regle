import { RegleFormPropertyType } from '@regle/core';
import { withMessage } from '@regle/validators';
import { z } from 'zod';
import { extractIssuesMessages, transformZodValidatorAdapter } from './shared';

export function zodDateToRegle(def: z.ZodDateDef, schema: z.ZodSchema<any>): RegleFormPropertyType {
  return Object.fromEntries(
    def.checks.map((check) => {
      return [
        check.kind,
        withMessage(transformZodValidatorAdapter(schema), extractIssuesMessages(schema, check)),
      ];
    })
  );
}
