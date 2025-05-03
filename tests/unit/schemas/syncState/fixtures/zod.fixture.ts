import { z } from 'zod';

export const zodTransformSchema = z.object({
  noChange: z.string(),
  withDefault: z.string().min(1).default('default value'),
  withCatch: z.string().catch('catch'),
  withTransform: z.string().transform((value) => `transform: ${value}`),
});
