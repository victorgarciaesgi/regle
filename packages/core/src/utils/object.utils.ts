export function mapEntries<T, K extends string>(
  obj: Record<K, T>,
  callback: (element: [K, T]) => void
) {
  return Object.entries(obj).map(callback as any);
}

export function isObject(obj: unknown): obj is Record<string, any> {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
}
