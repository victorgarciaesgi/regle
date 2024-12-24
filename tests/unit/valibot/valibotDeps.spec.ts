import { useValibotRegle, withDeps } from '@regle/valibot';
import * as v from 'valibot';
import { computed, reactive } from 'vue';
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
    return v.object({
      field1: v.string(),
      nested: v.object({
        field2: withDeps(
          v.pipe(
            v.string(),
            v.check((v) => v !== form.field1)
          ),
          [() => form.field1]
        ),
      }),
    });
  });

  return useValibotRegle(form, schema);
}

describe('Valibot deps using withDeps', async () => {
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
