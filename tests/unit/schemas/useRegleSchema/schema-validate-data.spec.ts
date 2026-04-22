import { useRegleSchema } from '@regle/schemas';
import { reactive } from 'vue';
import { z } from 'zod/v4';
import { createRegleComponent } from '../../../utils/test.utils';

describe('useRegleSchema - $validate() return data', () => {
  it('exposes schema output on data at runtime (coerce + transform)', async () => {
    const schema = z.object({
      count: z.coerce.number(),
      label: z.string().transform((s) => s.trim().toUpperCase()),
    });

    const form = reactive({ count: '42', label: '  hello  ' } as z.input<typeof schema>);

    const { vm } = createRegleComponent(() => useRegleSchema(form, schema));

    const { valid, data } = await vm.r$.$validate();

    expect(valid).toBe(true);
    expect(data).toBeDefined();

    expect(typeof data.count).toBe('number');
    expect(data.count).toBe(42);

    expect(typeof data.label).toBe('string');
    expect(data.label).toBe('HELLO');
  });
});
