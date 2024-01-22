import { z } from 'zod';

export function transformZodValidatorAdapter(schema: z.ZodSchema<any>) {
  return (value: unknown) => {
    return schema.safeParse(value).success;
  };
}

export function extractIssuesMessages(
  schema: z.ZodSchema<any>,
  check?: { kind: string; message?: string; [x: string]: any }
): (value: unknown) => string {
  return (value: unknown) => {
    const result = schema.safeParse(value);
    console.log(value, result.success);
    if (result.success) {
      return 'Error';
    } else {
      const issueMessage = result.error.issues.find((issue: any) => issue.type === check?.kind);
      return check?.message || issueMessage?.message || 'Error';
    }
  };
}
