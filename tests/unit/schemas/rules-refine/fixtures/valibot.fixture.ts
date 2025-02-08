import { useRegleSchema } from '@regle/schemas';
import * as v from 'valibot';
import { reactive } from 'vue';

export function valibotRulesRefineFixture() {
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
