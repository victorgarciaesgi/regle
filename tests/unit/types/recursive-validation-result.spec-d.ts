import { useRegle, type MaybeOutput } from '@regle/core';
import { required } from '@regle/rules';
import { expectTypeOf } from 'vitest';
import { ref } from 'vue';

type Category = {
  uuid: string;
  name: string;
  parent?: Category;
  children: Category[];
};

it('does not recursively inspect unruled self-referential fields in validation results', async () => {
  const form = ref<{ item: Category | null }>({ item: null });
  const { r$ } = useRegle(form, { item: { uuid: { required } } });

  const result = await r$.$validate();

  if (result.valid) {
    expectTypeOf(result.data.item.uuid).toEqualTypeOf<string>();
    expectTypeOf(result.data.item.name).toEqualTypeOf<MaybeOutput<string>>();
    expectTypeOf(result.data.item.parent).toEqualTypeOf<MaybeOutput<Category>>();
    expectTypeOf(result.data.item.children).toEqualTypeOf<MaybeOutput<Category[]>>();
  }
});
