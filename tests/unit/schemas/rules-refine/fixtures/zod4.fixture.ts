import { useRegleSchema } from '@regle/schemas';
import { reactive } from 'vue';
import { z } from 'zod/v4';

export function zod4RulesRefineFixture() {
  const zodSchema = z
    .object({
      password: z.string().min(1),
      nested: z
        .object({
          confirm: z
            .string()
            .min(1)
            .refine((value) => value.length > 2, { message: 'Confirm length should be > 2' }),
        })
        .refine(
          (data) => {
            return data.confirm === 'bar';
          },
          {
            path: ['confirm'],
            error: 'Value must be "bar"',
          }
        ),
      collection: z
        .array(
          z.object({
            child: z.string().min(1),
          })
        )
        .refine(
          (arg) => {
            return arg.every((v) => v.child?.length === 3);
          },
          {
            error: 'All items children length must be min 3',
          }
        )
        .refine((arg) => arg[0].child === 'foo', {
          error: 'First item must be "foo"',
          path: ['0', 'child'],
        }),
    })
    .refine(
      (data) => {
        return data.nested.confirm === data.password;
      },
      {
        path: ['nested', 'confirm'],
        error: 'Password and confirm must match',
      }
    );

  const form = reactive({ password: '', nested: { confirm: '' }, collection: [{ child: '' }] });

  return useRegleSchema(form, zodSchema);
}
