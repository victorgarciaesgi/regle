/**
 * Formats a file size in bytes to a human readable string.
 * @param size - The size in bytes
 * @returns The formatted size
 */
export function formatFileSize(size: number | undefined): string {
  if (size === undefined) {
    return '0 bytes';
  }
  if (size < 1024) {
    return `${size} bytes`;
  }
  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(2)} kb`;
  }
  if (size < 1024 * 1024 * 1024) {
    return `${(size / 1024 / 1024).toFixed(2)} mb`;
  }
  return `${(size / 1024 / 1024 / 1024).toFixed(2)} gb`;
}
