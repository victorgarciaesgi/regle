import type { InspectorStateItem } from './types';

/**
 * Check if a value is a function/method
 */
export function isMethod(value: unknown): boolean {
  return typeof value === 'function';
}

/**
 * Extract public properties from an object recursively
 * Excludes private properties (starting with _) and methods
 */
export function extractPublicProperties(obj: any, depth = 0): any {
  // Prevent infinite recursion
  if (depth > 10) return obj;

  // Handle primitives and arrays
  if (obj === null || obj === undefined || typeof obj !== 'object' || Array.isArray(obj)) {
    return obj;
  }

  const result: Record<string, any> = {};

  for (const key in obj) {
    // Skip private properties (starting with _) and methods
    // Keep $ properties as they are Regle's public API
    if (key.startsWith('_') || isMethod(obj[key])) {
      continue;
    }

    const value = obj[key];

    // Handle nested objects recursively (but not too deep)
    if (value && typeof value === 'object' && !Array.isArray(value) && depth < 3) {
      result[key] = extractPublicProperties(value, depth + 1);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Convert specific object keys to inspector state format
 */
export function toStateArray(obj: any, keys: readonly string[]): InspectorStateItem[] {
  return keys
    .filter((key) => key in obj && !isMethod(obj[key]))
    .map((key) => ({
      key,
      value: obj[key],
      editable: false,
    }));
}

/**
 * Get remaining properties not in the exclude list
 * Only returns properties starting with $
 */
export function getRemainingProperties(obj: any, excludeKeys: string[]): InspectorStateItem[] {
  return Object.entries(obj)
    .filter(([key]) => !excludeKeys.includes(key) && !key.startsWith('_') && key.startsWith('$') && !isMethod(obj[key]))
    .map(([key, value]) => ({
      key,
      value: value,
      editable: false,
    }));
}

/**
 * Parse a field node ID to extract instance ID and field name
 */
export function parseFieldNodeId(nodeId: string): { instanceId: string; fieldName: string } | null {
  if (!nodeId.includes(':field:')) return null;

  const [instanceId, , fieldName] = nodeId.split(':');
  return { instanceId, fieldName };
}

/**
 * Create a field node ID
 */
export function createFieldNodeId(instanceId: string, fieldName: string): string {
  return `${instanceId}:field:${fieldName}`;
}
