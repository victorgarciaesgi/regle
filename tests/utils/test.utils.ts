import type { Regle, RegleSingleField, SuperCompatibleRegle } from '@regle/core';
import { RegleVuePlugin } from '@regle/core';
import type { RegleSchema, RegleSingleFieldSchema } from '@regle/schemas';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';

export function createRegleComponent<
  T extends
    | Regle<any, any, any, any>
    | RegleSingleField<any, any>
    | RegleSchema<{}, StandardSchemaV1, {}, any>
    | RegleSingleFieldSchema<any, StandardSchemaV1, {}, any>
    | SuperCompatibleRegle,
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

export function shouldBePristineValidationObj(regle: Regle<any, any>) {
  expect(regle).toHaveProperty('$error', false);
  expect(regle).toHaveProperty('$invalid', false);
  expect(regle).toHaveProperty('$correct', false);
  expect(regle).toHaveProperty('$pending', false);
  expect(regle).toHaveProperty('$dirty', false);
  expect(regle).toHaveProperty('$anyDirty', false);
  expect(regle).toHaveProperty('$touch', expect.any(Function));
  expect(regle).toHaveProperty('$reset', expect.any(Function));
}

export function shouldBeValidValidationObj(regle: Regle<any, any>) {
  expect(regle).toHaveProperty('$error', false);
  expect(regle).toHaveProperty('$invalid', false);
  expect(regle).toHaveProperty('$pending', false);
}
