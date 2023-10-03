export function isObject(obj: unknown): obj is Record<string, any> {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}
