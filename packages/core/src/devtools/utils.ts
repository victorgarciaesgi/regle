import type { InspectorStateItem } from './types';

export function isMethod<T>(value: T): value is T & Function {
  return typeof value === 'function';
}

export function getPriorityProperties(obj: Record<string, any>, keys: readonly string[]): InspectorStateItem[] {
  return keys
    .filter((key) => key in obj && !isMethod(obj[key]))
    .map((key) => {
      let editable = false;
      if (key === '$value') {
        editable = true;
      }
      return {
        key,
        value: obj[key],
        editable,
      };
    });
}

export function getRemainingProperties(obj: Record<string, any>, excludeKeys: string[]): InspectorStateItem[] {
  return Object.entries(obj)
    .filter(([key]) => !excludeKeys.includes(key) && key.startsWith('$') && !isMethod(obj[key]))
    .map(([key, value]) => ({
      key,
      value: value,
      editable: false,
    }));
}

export function parseFieldNodeId(nodeId: string): { instanceId: string; fieldName: string } | null {
  if (!nodeId.includes(':field:')) return null;

  const [instanceId, , fieldName] = nodeId.split(':');
  return { instanceId, fieldName };
}

export function createFieldNodeId(instanceId: string, fieldName: string): string {
  return `${instanceId}:field:${fieldName}`;
}
