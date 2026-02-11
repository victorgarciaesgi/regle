import type { Regle, RegleSingleField, SuperCompatibleRegle } from '@regle/core';
import { RegleVuePlugin } from '@regle/core';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';

export function createRegleComponent<
  T extends Regle<any, any, any, any> | RegleSingleField<any, any> | SuperCompatibleRegle,
>(regleComposable: () => T) {
  return mount(
    defineComponent({
      setup() {
        return regleComposable();
      },
      template: '<div></div>',
    }),
    {
      global: {
        plugins: [RegleVuePlugin],
      },
    }
  );
}
