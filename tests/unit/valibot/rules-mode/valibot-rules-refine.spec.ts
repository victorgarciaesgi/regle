import { useRegleSchema } from '@regle/schemas';
import { reactive } from 'vue';
import * as v from 'valibot';
import { createRegleComponent } from '../../../utils/test.utils';
import { shouldBeErrorField, shouldBeValidField } from '../../../utils/validations.utils';

function nestedReactiveObjectValidation() {
  const valibotSchema = v.pipe(
    v.object({
      password: v.pipe(v.string(), v.minLength(1)),
      nested: v.pipe(
        v.object({
          confirm: v.pipe(
            v.string(),
            v.minLength(1),
            v.check((value) => value.length > 2, 'Confirm length should be > 2')
          ),
        }),
        v.rawCheck(({ dataset, addIssue }) => {
          if (dataset.typed) {
            if (dataset.value.confirm !== 'bar') {
              addIssue({
                path: [
                  {
                    key: 'confirm',
                    type: 'object',
                    origin: 'value',
                    input: dataset.value,
                    value: dataset.value.confirm,
                  },
                ],
                message: 'Value must be "bar"',
              });
            }
          }
        })
      ),
      collection: v.pipe(
        v.array(
          v.object({
            child: v.pipe(v.string(), v.minLength(1)),
          })
        ),
        v.check((arg) => {
          return arg.every((v) => v.child?.length === 3);
        }, 'All items children length must be min 3'),
        v.rawCheck(({ addIssue, dataset }) => {
          if (dataset.typed) {
            if (dataset.value[0].child !== 'foo') {
              addIssue({
                path: [
                  {
                    key: 0,
                    type: 'array',
                    origin: 'value',
                    input: dataset.value,
                    value: dataset.value[0],
                  },
                  {
                    key: 'child',
                    type: 'object',
                    origin: 'value',
                    input: dataset.value[0],
                    value: dataset.value[0].child,
                  },
                ],
                message: 'First item must be "foo"',
              });
            }
          }
        })
      ),
    }),
    v.rawCheck(({ dataset, addIssue }) => {
      if (dataset.typed) {
        if (dataset.value.nested.confirm !== dataset.value.password) {
          addIssue({
            path: [
              {
                key: 'nested',
                type: 'object',
                origin: 'value',
                input: dataset.value,
                value: dataset.value.nested,
              },
              {
                key: 'confirm',
                type: 'object',
                origin: 'value',
                input: dataset.value.nested,
                value: dataset.value.nested.confirm,
              },
            ],
            message: 'Password and confirm must match',
          });
        }
      }
    })
  );

  const form = reactive({ password: '', nested: { confirm: '' }, collection: [{ child: '' }] });

  return useRegleSchema(form, valibotSchema);
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

    vm.r$.$value.collection[0].child = 'a';
    await vm.$nextTick();

    shouldBeErrorField(vm.r$.$fields.collection.$self);
    expect(vm.r$.$fields.collection.$self.$errors).toStrictEqual(['All items children length must be min 3']);
    shouldBeErrorField(vm.r$.$fields.collection.$each[0].$fields.child);
    expect(vm.r$.$fields.collection.$each[0].$fields.child.$errors).toStrictEqual(['First item must be "foo"']);

    vm.r$.$value.collection.push({ child: 'bar' });
    await vm.$nextTick();
    vm.r$.$fields.collection.$each[1].$touch();
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.collection.$each[1].$fields.child);
    expect(vm.r$.$fields.collection.$each[1].$fields.child.$errors).toStrictEqual([]);

    vm.r$.$value.collection[0].child = 'foo';
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.collection.$self);
    expect(vm.r$.$fields.collection.$self.$errors).toStrictEqual([]);
    shouldBeValidField(vm.r$.$fields.collection.$each[0].$fields.child);
    expect(vm.r$.$fields.collection.$each[0].$fields.child.$errors).toStrictEqual([]);

    vm.r$.$value.collection.splice(0, 1);
    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.collection.$self);
    expect(vm.r$.$fields.collection.$self.$errors).toStrictEqual([]);
    shouldBeErrorField(vm.r$.$fields.collection.$each[0].$fields.child);
    expect(vm.r$.$fields.collection.$each[0].$fields.child.$errors).toStrictEqual(['First item must be "foo"']);
  });
});
