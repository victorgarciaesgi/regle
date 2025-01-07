export function isObject(obj: unknown): obj is Record<string, any> {
  if (obj instanceof Date || obj instanceof File) {
    return false;
  }
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}
