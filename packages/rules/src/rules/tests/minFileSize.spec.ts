import { minFileSize } from '../minFileSize';

describe('minFileSize validator', () => {
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
