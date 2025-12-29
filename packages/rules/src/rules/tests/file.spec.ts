import { file } from '../file';

describe('file', () => {
  it('should not validate undefined values', () => {
    expect(file.exec(null)).toBe(true);
    expect(file.exec(undefined)).toBe(true);
  });

  it('should validate Date value', () => {
    expect(file.exec(new File([], 'test.txt'))).toBe(true);
  });

  it('should not validate other values', () => {
    expect(file.exec(0)).toBe(false);
    expect(file.exec(1)).toBe(false);
    expect(file.exec(true)).toBe(false);
    expect(file.exec(false)).toBe(false);
  });
});
