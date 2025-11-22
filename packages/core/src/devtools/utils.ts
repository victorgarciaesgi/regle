import type { StateBase } from '@vue/devtools-kit';

export function isMethod<T>(value: T): value is T & Function {
  return typeof value === 'function';
}

export function getPriorityProperties(obj: Record<string, any>, keys: readonly string[]): StateBase[] {
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

export function getRemainingProperties(obj: Record<string, any>, excludeKeys: string[]): StateBase[] {
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

export function parseRuleNodeId(nodeId: string): { instanceId: string; fieldName: string; ruleName: string } | null {
  if (!nodeId.includes(':rule:')) return null;

  const parts = nodeId.split(':rule:');
  if (parts.length !== 2) return null;

  const fieldPart = parts[0];
  const ruleName = parts[1];

  const fieldInfo = parseFieldNodeId(fieldPart);
  if (!fieldInfo) return null;

  return { ...fieldInfo, ruleName };
}

export function createRuleNodeId(instanceId: string, fieldName: string, ruleName: string): string {
  return `${createFieldNodeId(instanceId, fieldName)}:rule:${ruleName}`;
}
