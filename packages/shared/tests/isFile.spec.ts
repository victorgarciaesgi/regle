import { describe, it, expect } from 'vitest';
import { isFile } from '../utils/isFile';

describe('isFile', () => {
  it('should return true for File instances', () => {
    const file = new File(['content'], 'test.txt');
    expect(isFile(file)).toBe(true);
  });

  it('should return false for non-file values', () => {
    expect(isFile(null)).toBe(false);
    expect(isFile(undefined)).toBe(false);
    expect(isFile('string')).toBe(false);
    expect(isFile(123)).toBe(false);
    expect(isFile(true)).toBe(false);
    expect(isFile({})).toBe(false);
    expect(isFile([])).toBe(false);
    expect(isFile(new Date())).toBe(false);
  });

  it('should return false for objects with file-like properties', () => {
    const fakeFile = {
      name: 'test.txt',
      size: 100,
      type: 'text/plain',
    };
    expect(isFile(fakeFile)).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(isFile({ constructor: null })).toBe(false);
    expect(isFile({ constructor: { name: 'Object' } })).toBe(false);
    expect(isFile({ constructor: { name: 'Array' } })).toBe(false);
  });

  it('should work with actual File objects', () => {
    const file1 = new File(['content1'], 'file1.txt', { type: 'text/plain' });
    const file2 = new File(['content2'], 'file2.png', { type: 'image/png' });
    const emptyFile = new File([], 'empty.txt');

    expect(isFile(file1)).toBe(true);
    expect(isFile(file2)).toBe(true);
    expect(isFile(emptyFile)).toBe(true);
  });
});
