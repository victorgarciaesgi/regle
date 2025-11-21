import type { SuperCompatibleRegleRoot } from '../types';
import { PRIORITY_KEYS } from './constants';
import type { RegleInstance } from './registry';
import type { InspectorState, InspectorStateItem } from './types';
import { extractPublicProperties, getRemainingProperties, parseFieldNodeId, toStateArray } from './utils';

/**
 * Build state for a field node
 */
function buildFieldState(fieldStatus: any): InspectorState {
  const state: InspectorState = {};

  // Priority properties
  const priorityProperties = toStateArray(fieldStatus, PRIORITY_KEYS.FIELD);
  if (priorityProperties.length > 0) {
    state['State'] = priorityProperties;
  }

  // Remaining properties
  const remainingProperties = getRemainingProperties(fieldStatus, [...PRIORITY_KEYS.FIELD, '$rules', '$fields']);
  if (remainingProperties.length > 0) {
    state['Other Properties'] = remainingProperties;
  }

  // Rules section
  if (fieldStatus.$rules && typeof fieldStatus.$rules === 'object') {
    const rulesSection: InspectorStateItem[] = [];

    Object.entries(fieldStatus.$rules).forEach(([ruleName, ruleStatus]: [string, any]) => {
      if (ruleStatus && typeof ruleStatus === 'object') {
        const ruleProps = extractPublicProperties(ruleStatus);
        rulesSection.push({
          key: ruleName,
          value: ruleProps,
          editable: false,
        });
      }
    });

    if (rulesSection.length > 0) {
      state['Rules'] = rulesSection;
    }
  }

  return state;
}

/**
 * Build state for a root instance node
 */
function buildRootState(r$: SuperCompatibleRegleRoot): InspectorState {
  const state: InspectorState = {};

  // Priority properties
  const priorityProperties = toStateArray(r$ as any, PRIORITY_KEYS.ROOT);
  if (priorityProperties.length > 0) {
    state['State'] = priorityProperties;
  }

  // Remaining properties (excluding $fields)
  const remainingProperties = getRemainingProperties(r$ as any, [...PRIORITY_KEYS.ROOT, '$fields']);
  if (remainingProperties.length > 0) {
    state['Other Properties'] = remainingProperties;
  }

  return state;
}

/**
 * Resolve a field by path (supports nested fields and collections)
 * Example paths: "email", "users[0]", "users[0].name"
 */
function resolveFieldByPath(fields: any, path: string): any {
  if (!fields || !path) return null;

  // Split path by dots and brackets
  const segments = path.match(/[^.\[\]]+/g);
  if (!segments) return null;

  let current = fields;

  for (const segment of segments) {
    if (!current) return null;

    // Check if segment is a number (array index)
    const index = parseInt(segment, 10);
    if (!isNaN(index)) {
      // This is an array index, access $each
      if (current.$each && Array.isArray(current.$each)) {
        current = current.$each[index];
      } else {
        return null;
      }
    } else {
      // This is a property name
      if (current.$fields && current.$fields[segment]) {
        current = current.$fields[segment];
      } else if (current[segment]) {
        current = current[segment];
      } else {
        return null;
      }
    }
  }

  return current;
}

/**
 * Build the inspector state based on the selected node
 */
export function buildInspectorState(
  nodeId: string,
  getInstance: (id: string) => RegleInstance | undefined
): InspectorState | null {
  // Check if this is a field node
  const fieldInfo = parseFieldNodeId(nodeId);

  if (fieldInfo) {
    // Field node (may be nested or collection item)
    const { instanceId, fieldName } = fieldInfo;
    const instance = getInstance(instanceId);

    if (!instance || !instance.r$.$fields) return null;

    // Resolve the field by path (handles nested fields and collections)
    const fieldStatus = resolveFieldByPath(instance.r$.$fields, fieldName);
    if (!fieldStatus) return null;

    return buildFieldState(fieldStatus as any);
  } else {
    // Root instance node
    const instance = getInstance(nodeId);
    if (!instance) return null;

    return buildRootState(instance.r$);
  }
}
