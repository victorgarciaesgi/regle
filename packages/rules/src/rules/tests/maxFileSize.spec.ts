import { defineRegleConfig, useRegle } from '@regle/core';
import { maxFileSize } from '../maxFileSize';
import { withMessage } from '../..';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';

describe('maxFileSize exec', () => {
  it('should not validate undefined values', () => {
    expect(maxFileSize(1000).exec(null)).toBe(true);
    expect(maxFileSize(1000).exec(undefined)).toBe(true);
  });

  it('should validate File with size equal to maxSize', () => {
    expect(maxFileSize(1000).exec(new File([new ArrayBuffer(1000)], 'test.txt'))).toBe(true);
  });

  it('should validate File with size less than maxSize', () => {
    expect(maxFileSize(1000).exec(new File([new ArrayBuffer(500)], 'test.txt'))).toBe(true);
  });

  it('should not validate File with size greater than maxSize', () => {
    expect(maxFileSize(1000).exec(new File([new ArrayBuffer(2000)], 'test.txt'))).toBe(false);
  });

  it('should validate empty File', () => {
    expect(maxFileSize(1000).exec(new File([], 'test.txt'))).toBe(true);
  });

  it('should validate empty File when maxSize is 0', () => {
    expect(maxFileSize(0).exec(new File([], 'test.txt'))).toBe(true);
  });

  it('should not validate File when maxSize is 0 and file has content', () => {
    expect(maxFileSize(0).exec(new File([new ArrayBuffer(1)], 'test.txt'))).toBe(false);
  });

  it('should not validate non-File values', () => {
    expect(maxFileSize(1000).exec(0 as any)).toBe(true);
    expect(maxFileSize(1000).exec(1 as any)).toBe(true);
    expect(maxFileSize(1000).exec(true as any)).toBe(true);
    expect(maxFileSize(1000).exec(false as any)).toBe(true);
    expect(maxFileSize(1000).exec('string' as any)).toBe(true);
    expect(maxFileSize(1000).exec({ size: 500 } as any)).toBe(true);
    expect(maxFileSize(1000).exec([1, 2, 3] as any)).toBe(true);
  });
});

describe('maxFileSize on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ file: null as File | null }, { file: { maxFileSize: maxFileSize(1000) } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.file.$touch();

    vm.r$.file.$value = new File([new ArrayBuffer(2000)], 'test.txt');
    await nextTick();
    expect(vm.r$.file.$error).toBe(true);
    expect(vm.r$.file.$errors).toStrictEqual(['File size (1.95 kb) cannot exceed 1000 bytes']);
  });
});

describe('maxFileSize on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          maxFileSize: withMessage(maxFileSize, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
