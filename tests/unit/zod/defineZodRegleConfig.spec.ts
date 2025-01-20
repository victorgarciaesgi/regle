import { ref } from 'vue';
import z from 'zod';
import { createRegleComponent } from '../../utils/test.utils';
import { shouldBeInvalidField, shouldBeValidField } from '../../utils/validations.utils';
import { defineRegleSchemaConfig } from '@regle/schemas';

function nestedRefObjectValidation() {
  const { useRegleSchema } = defineRegleSchemaConfig({});

  const condition = ref(true);
  const form = ref({
    level0: '',
    level1: {
      level2: {
        child: '',
      },
    },
    collection: [{ name: '' }],
  });

  return {
    condition,
    ...useRegleSchema(
      form,
      z.object({
        level0: z.string().nonempty(),
        level1: z.object({
          level2: z.object({
            child: z.string().nonempty(),
          }),
        }),
        collection: z.array(
          z.object({
            name: z.string().nonempty(),
          })
        ),
      })
    ),
  };
}

describe('defineRegleConfig rules', () => {
  it('should display global errors instead of rule-defined error', async () => {
    const { vm } = createRegleComponent(nestedRefObjectValidation);

    shouldBeInvalidField(vm.r$.$fields.level0);
    shouldBeInvalidField(vm.r$.$fields.level1.$fields.level2.$fields.child);
    shouldBeInvalidField(vm.r$.$fields.collection.$each[0].$fields.name);

    vm.r$.$value = {
      level0: 'foo',
      level1: {
        level2: {
          child: 'foo',
        },
      },
      collection: [{ name: 'foo' }, { name: '' }],
    };

    await vm.$nextTick();

    shouldBeValidField(vm.r$.$fields.level0);
    shouldBeValidField(vm.r$.$fields.level1.$fields.level2.$fields.child);
    shouldBeValidField(vm.r$.$fields.collection.$each[0].$fields.name);

    vm.condition = false;
    await vm.$nextTick();
  });
});
