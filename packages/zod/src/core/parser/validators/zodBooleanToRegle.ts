import { RegleFormPropertyType } from '@regle/core';
import { withMessage } from '@regle/validators';
import { z } from 'zod';
import { extractIssuesMessages } from './shared';

export function zodBooleanToRegle(
  def: z.ZodBooleanDef,
  schema: z.ZodSchema<any>
): RegleFormPropertyType {
  return {
    bool: withMessage((value: unknown) => !!value, extractIssuesMessages(schema)),
  };
}
