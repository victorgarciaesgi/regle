import { useZodRegle, withDeps } from '@regle/zod';
import { computed, reactive } from 'vue';
import { z } from 'zod';
import { createRegleComponent } from '../../utils/test.utils';
import { shouldBeErrorField, shouldBeValidField } from '../../utils/validations.utils';

function nestedReactiveObjectValidation() {
  const form = reactive({
    field1: '',
    nested: {
      field2: '',
    },
  });

  const schema = computed(() => {
    return z.object({
      field1: z.string(),
      nested: z.object({
        field2: withDeps(
          z.string().refine((v) => v !== form.field1),
          [() => form.field1]
        ),
      }),
    });
  });

  return useZodRegle(form, schema);
}

describe('Zod deps using withDeps', async () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const { vm } = createRegleComponent(nestedReactiveObjectValidation);

  it('should update computed schema when forced dep changes', async () => {
    vm.r$.$value.nested.field2 = 'Hello';
    await vm.$nextTick();
    shouldBeValidField(vm.r$.$fields.nested.$fields.field2);

    vm.r$.$value.field1 = 'Hello';
    await vm.$nextTick();
    shouldBeErrorField(vm.r$.$fields.nested.$fields.field2);

    vm.r$.$value.nested.field2 = 'Foo';
    await vm.$nextTick();
    shouldBeValidField(vm.r$.$fields.nested.$fields.field2);

    vm.r$.$value.field1 = 'Foo';
    await vm.$nextTick();
    shouldBeErrorField(vm.r$.$fields.nested.$fields.field2);
  });
});
