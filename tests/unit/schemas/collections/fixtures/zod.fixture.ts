import { z } from 'zod/v4';

export function zodFixture() {
  return z.object({
    name: z.string().min(1),
    array: z.array(
      z.object({
        test: z.string().min(1),
        nested_array: z.array(
          z.object({
            rest: z.string().min(1),
          })
        ),
      })
    ),
  });
}
