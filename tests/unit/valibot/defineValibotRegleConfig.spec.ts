import { ref } from 'vue';
import * as v from 'valibot';
import { defineValibotRegleConfig } from '@regle/valibot';
import { createRegleComponent } from '../../utils/test.utils';
import { shouldBeInvalidField, shouldBeValidField } from '../../utils/validations.utils';

function nestedRefObjectValidation() {
  const { useValibotRegle } = defineValibotRegleConfig({});

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
    ...useValibotRegle(
      form,
      v.object({
        level0: v.pipe(v.string(), v.nonEmpty()),
        level1: v.object({
          level2: v.object({
            child: v.pipe(v.string(), v.nonEmpty()),
          }),
        }),
        collection: v.array(
          v.object({
            name: v.pipe(v.string(), v.nonEmpty()),
          })
        ),
      })
    ),
  };
}

describe('defineRegleConfig rules for Valibot', () => {
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
