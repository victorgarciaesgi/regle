import { formatFileSize } from '../utils';

describe('test the formatFileSize helper', () => {
  it.each([
    [undefined, '0 bytes'],
    [0, '0 bytes'],
    [512, '512 bytes'],
    [1023, '1023 bytes'],
    [1024, '1.00 kb'],
    [1536, '1.50 kb'],
    [1024 * 1024 - 1, '1024.00 kb'],
    [1024 * 1024, '1.00 mb'],
    [1024 * 1024 * 1.5, '1.50 mb'],
    [1024 * 1024 * 1024 - 1, '1024.00 mb'],
    [1024 * 1024 * 1024, '1.00 gb'],
    [1024 * 1024 * 1024 * 2.5, '2.50 gb'],
  ])('formatFileSize(%s) should be %s', (size, expected) => {
    expect(formatFileSize(size)).toBe(expected);
  });
});
