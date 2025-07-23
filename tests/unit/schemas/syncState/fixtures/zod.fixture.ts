import { useRegleSchema, type RegleSchemaBehaviourOptions } from '@regle/schemas';
import { z } from 'zod/v3';

export function zodRegleTransform(options?: RegleSchemaBehaviourOptions) {
  const zodTransformSchema = z.object({
    noChange: z.string(),
    withDefault: z.string().min(1).default('default value'),
    withCatch: z.string().catch('catch'),
    withTransform: z.string().transform((value) => `transform: ${value}`),
  });

  return useRegleSchema(
    { noValidationValue: 'foo' } as unknown as z.infer<typeof zodTransformSchema>,
    zodTransformSchema,
    options
  );
}
