import { defineRegleConfig } from '@regle/core';
import { minFileSize } from '../minFileSize';
import { withMessage } from '../..';
import { createRegleComponent } from './utils';
import { nextTick } from 'vue';
import { useRegle } from '@regle/core';

describe('minFileSize exec', () => {
  it('should not validate undefined values', () => {
    expect(minFileSize(1000).exec(null)).toBe(true);
    expect(minFileSize(1000).exec(undefined)).toBe(true);
  });

  it('should validate File with size equal to minSize', () => {
    expect(minFileSize(1000).exec(new File([new ArrayBuffer(1000)], 'test.txt'))).toBe(true);
  });

  it('should validate File with size greater than minSize', () => {
    expect(minFileSize(1000).exec(new File([new ArrayBuffer(2000)], 'test.txt'))).toBe(true);
  });

  it('should not validate File with size less than minSize', () => {
    expect(minFileSize(1000).exec(new File([new ArrayBuffer(500)], 'test.txt'))).toBe(false);
  });

  it('should not validate empty File', () => {
    expect(minFileSize(1000).exec(new File([], 'test.txt'))).toBe(true);
  });

  it('should validate empty File when minSize is 0', () => {
    expect(minFileSize(0).exec(new File([], 'test.txt'))).toBe(true);
  });

  it('should not validate non-File values', () => {
    expect(minFileSize(1000).exec(0 as any)).toBe(true);
    expect(minFileSize(1000).exec(1 as any)).toBe(true);
    expect(minFileSize(1000).exec(true as any)).toBe(true);
    expect(minFileSize(1000).exec(false as any)).toBe(true);
    expect(minFileSize(1000).exec('string' as any)).toBe(true);
    expect(minFileSize(1000).exec({ size: 2000 } as any)).toBe(true);
    expect(minFileSize(1000).exec([1, 2, 3] as any)).toBe(true);
  });
});

describe('minFileSize on useRegle', () => {
  it('should work with useRegle', async () => {
    function formComponent() {
      return useRegle({ file: null as File | null }, { file: { minFileSize: minFileSize(1000) } });
    }
    const { vm } = createRegleComponent(formComponent);

    vm.r$.file.$value = new File([new ArrayBuffer(500)], 'test.txt');
    await nextTick();
    expect(vm.r$.file.$error).toBe(true);
    expect(vm.r$.file.$errors).toStrictEqual(['File size (500 bytes) must be at least 1000 bytes']);
  });
});

describe('minFileSize on defineRegleConfig', () => {
  it('should work with defineRegleConfig', async () => {
    expect(() =>
      defineRegleConfig({
        rules: () => ({
          minFileSize: withMessage(minFileSize, 'New message'),
        }),
      })
    ).not.toThrowError();
  });
});
