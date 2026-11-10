import { nextTick, ref } from 'vue';
import { useRegle } from '@regle/core';
import { required } from '@regle/rules';
import { isEqual } from '../../../packages/shared/utils/isEqual';
import { cloneDeep } from '../../../packages/shared/utils/cloneDeep';

describe('null-prototype objects in state', () => {
  it('does not throw on creation, edit, validate and reset', async () => {
    const attrs = Object.assign(Object.create(null), { level: 2 });
    const form = ref({ title: '', doc: { type: 'doc', attrs, content: [{ type: 'heading', attrs }] } });
    const { r$ } = useRegle(form, { title: { required } });
    form.value.doc.attrs = Object.assign(Object.create(null), { level: 3 });

    await nextTick();

    expect(r$.$anyEdited).toBe(true);

    const res = await r$.$validate();

    expect(res.valid).toBe(false);
  });

  it('isEqual and cloneDeep handle null-prototype objects', () => {
    const a = Object.assign(Object.create(null), { level: 2 });
    const b = Object.assign(Object.create(null), { level: 2 });
    expect(isEqual(a, b, true)).toBe(true);
    expect(cloneDeep(a)).toEqual(a);
  });
});
