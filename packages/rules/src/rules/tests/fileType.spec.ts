import { defineRegleConfig, useRegle } from '@regle/core';
import { fileType } from '../fileType';
import { withMessage } from '../..';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';

describe('fileType exec', () => {
  it('should not validate undefined values', () => {
    expect(fileType(['image/png', 'image/jpeg']).exec(null)).toBe(true);
    expect(fileType(['image/png', 'image/jpeg']).exec(undefined)).toBe(true);
  });

  it('should validate File value', () => {
    expect(
      fileType(['image/png', 'image/jpeg'] as const).exec(
        new File([new ArrayBuffer(1000)], 'test.png', { type: 'image/png' })
      )
    ).toBe(true);
  });

  it('should not validate other formats', () => {
    expect(
      fileType(['image/png', 'image/jpeg']).exec(new File([new ArrayBuffer(1000)], 'test.jpg', { type: 'image/jpeg' }))
    ).toBe(true);
    expect(
      fileType(['image/png', 'image/jpeg']).exec(new File([new ArrayBuffer(1000)], 'test.txt', { type: 'text/plain' }))
    ).toBe(false);
  });
});

describe('fileType on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ file: null as File | null }, { file: { fileType: fileType(['image/png', 'image/jpeg']) } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.file.$value = new File([new ArrayBuffer(1000)], 'test.jpg', { type: 'image/jpeg' });
    await nextTick();
    expect(vm.r$.file.$error).toBe(false);
    expect(vm.r$.file.$errors).toStrictEqual([]);

    vm.r$.file.$value = new File([new ArrayBuffer(1000)], 'test.txt', { type: 'text/plain' });
    await nextTick();
    expect(vm.r$.file.$error).toBe(true);
    expect(vm.r$.file.$errors).toStrictEqual(['File type is not allowed. Allowed types are: png, jpeg.']);
  });
});

describe('fileType on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          fileType: withMessage(fileType, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
