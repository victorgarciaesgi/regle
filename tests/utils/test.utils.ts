import type { Regle } from '@regle/core';
import type { ValibotRegle } from '@regle/valibot';
import type { ZodRegle } from '@regle/zod';
import type { VueWrapper } from '@vue/test-utils';
import { mount } from '@vue/test-utils';
import { defineComponent } from 'vue';
import type * as v from 'valibot';
import type { MaybeObjectAsync } from '../../packages/valibot/src/types';

export function createRegleComponent<T extends Regle<any, any, any, any> | ZodRegle<any, any> | ValibotRegle<any, any>>(
  regleComposable: () => T
) {
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
