import { useRegleSchema } from '@regle/schemas';
import { reactive } from 'vue';
import { z } from 'zod';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBeValidField } from '../../../utils/validations.utils';

function nestedReactiveObjectValidation() {
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
        .refine((data) => data.confirm === 'bar', {
          path: ['confirm'],
          message: 'Value must be "bar"',
        }),
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
            message: 'All items children length must be min 3',
          }
        )
        .refine((arg) => arg[0].child === 'foo', {
          message: 'First item must be "foo"',
          path: ['0', 'child'],
        }),
    })
    .refine((data) => data.nested.confirm === data.password, {
      path: ['nested', 'confirm'],
      message: 'Password and confirm must match',
    });

  const form = reactive({ password: '', nested: { confirm: '' }, collection: [{ child: '' }] });

  return useRegleSchema(form, zodSchema);
}

describe('zod - rules refinements ', async () => {
  it('should take refinements in zod schemas', async () => {
    const { vm } = createRegleComponent(nestedReactiveObjectValidation);

    vm.r$.$value.password = 'a';
    await vm.$nextTick();
    vm.r$.$value.nested.confirm = 'b';
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.password);
    expect(vm.r$.$fields.password.$errors).toStrictEqual([]);
    shouldBeErrorField(vm.r$.$fields.nested.$fields.confirm);
    expect(vm.r$.$fields.nested.$fields.confirm.$errors).toStrictEqual([
      'Confirm length should be > 2',
      'Value must be "bar"',
      'Password and confirm must match',
    ]);

    vm.r$.$value.nested.confirm = 'bar';
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.password);
    expect(vm.r$.$fields.password.$errors).toStrictEqual([]);

    shouldBeErrorField(vm.r$.$fields.nested.$fields.confirm);
    expect(vm.r$.$fields.nested.$fields.confirm.$errors).toStrictEqual(['Password and confirm must match']);

    vm.r$.$value.password = 'bar';
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.nested.$fields.confirm);
    shouldBeValidField(vm.r$.$fields.nested);
    expect(vm.r$.$fields.nested.$fields.confirm.$errors).toStrictEqual([]);
  });
});
