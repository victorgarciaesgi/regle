/**
 * Server side friendly way of checking for a File
 */
export function isFile(value: unknown) {
  return value?.constructor?.name == 'File' || value?.constructor?.name == 'FileList';
}
