import type { Regle } from '@regle/core';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';

export function createRegleComponent<T extends Regle<any, any>>(regleComposable: () => T) {
  return mount(
    defineComponent({
      setup() {
        return regleComposable();
      },
      template: '<div></div>',
    })
  );
}

export function shouldBePristineValidationObj(regle: Regle<any, any>) {
  expect(regle).toHaveProperty('$error', false);
  expect(regle).toHaveProperty('$invalid', false);
  expect(regle).toHaveProperty('$valid', false);
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
