import type { z } from 'zod';

export function transformZodValidatorAdapter(schema: z.ZodSchema<any>) {
  return async (value: unknown) => {
    const result = await schema.safeParseAsync(value);

    if (result.success) {
      return {
        $valid: true,
        $issues: [],
      };
    } else {
      return {
        $valid: false,
        $issues: result.error.issues,
      };
    }
  };
}
