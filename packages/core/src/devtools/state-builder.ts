import { isCollectionRulesStatus, isNestedRulesStatus } from '../core/useRegle/guards';
import type { $InternalRegleFieldStatus, $InternalRegleStatusType, SuperCompatibleRegleRoot } from '../types';
import { PRIORITY_KEYS } from './constants';
import type { RegleInstance } from './registry';
import type { FieldsDictionary, InspectorState, InspectorStateItem } from './types';
import { getRemainingProperties, parseFieldNodeId, getPriorityProperties } from './utils';

/**
 * Build state for a field node
 */
function buildFieldState(fieldStatus: $InternalRegleFieldStatus): InspectorState {
  const state: InspectorState = {};

  // Priority properties
  const priorityProperties = getPriorityProperties(fieldStatus, PRIORITY_KEYS.FIELD);
  if (priorityProperties.length > 0) {
    state['State'] = priorityProperties;
  }

  // Remaining properties
  const remainingProperties = getRemainingProperties(fieldStatus, [...PRIORITY_KEYS.FIELD, '$rules', '$fields']);
  if (remainingProperties.length > 0) {
    state['Other Properties'] = remainingProperties;
  }

  if (fieldStatus.$rules && typeof fieldStatus.$rules === 'object') {
    const rulesSection: InspectorStateItem[] = [];

    Object.entries(fieldStatus.$rules).forEach(([ruleName, ruleStatus]: [string, any]) => {
      if (ruleStatus && typeof ruleStatus === 'object') {
        const ruleProps = getRemainingProperties(ruleStatus, []);
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

function buildRootState(r$: SuperCompatibleRegleRoot): InspectorState {
  const state: InspectorState = {};

  const priorityProperties = getPriorityProperties(r$, PRIORITY_KEYS.ROOT);
  if (priorityProperties.length > 0) {
    state['State'] = priorityProperties;
  }

  const remainingProperties = getRemainingProperties(r$, [...PRIORITY_KEYS.ROOT, '$fields']);
  if (remainingProperties.length > 0) {
    state['Other Properties'] = remainingProperties;
  }

  return state;
}

export function resolveFieldByPath(fields: FieldsDictionary, path: string): $InternalRegleStatusType | null {
  if (!fields || !path) return null;

  const segments = path.match(/[^.\[\]]+/g);
  if (!segments) return null;

  let current: any = fields;

  for (const segment of segments) {
    if (!current) return null;

    const index = parseInt(segment);
    if (!isNaN(index)) {
      if (isCollectionRulesStatus(current) && Array.isArray(current.$each)) {
        current = current.$each[index];
      } else {
        return null;
      }
    } else {
      if (isNestedRulesStatus(current) && current.$fields && current.$fields[segment]) {
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

export function buildInspectorState(
  nodeId: string,
  getInstance: (id: string) => RegleInstance | undefined
): InspectorState | null {
  const fieldInfo = parseFieldNodeId(nodeId);

  if (fieldInfo) {
    const { instanceId, fieldName } = fieldInfo;
    const instance = getInstance(instanceId);

    if (!instance || !instance.r$.$fields) return null;

    const fieldStatus = resolveFieldByPath(instance.r$.$fields, fieldName);
    if (!fieldStatus) return null;

    return buildFieldState(fieldStatus as any);
  } else {
    const instance = getInstance(nodeId);
    if (!instance) return null;

    return buildRootState(instance.r$);
  }
}
