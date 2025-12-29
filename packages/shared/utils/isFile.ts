/**
 * Server side friendly way of checking for a File
 */
export function isFile(value: unknown): value is File {
  return value?.constructor?.name == 'File';
}
