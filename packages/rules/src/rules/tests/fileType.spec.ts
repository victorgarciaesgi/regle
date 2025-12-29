import { fileType } from '../fileType';

describe('fileType validator', () => {
  it('should not validate undefined values', () => {
    expect(fileType(['image/png', 'image/jpeg']).exec(null)).toBe(true);
    expect(fileType(['image/png', 'image/jpeg']).exec(undefined)).toBe(true);
  });

  it('should validate File value', () => {
    expect(
      fileType(['image/png', 'image/jpeg']).exec(new File([new ArrayBuffer(1000)], 'test.png', { type: 'image/png' }))
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
