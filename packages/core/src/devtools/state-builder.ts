import type { CustomInspectorState } from '@vue/devtools-kit';
import { isCollectionRulesStatus, isNestedRulesStatus } from '../core/useRegle/guards';
import type {
  $InternalRegleFieldStatus,
  $InternalRegleRuleStatus,
  $InternalRegleStatusType,
  SuperCompatibleRegleRoot,
} from '../types';
import { PRIORITY_KEYS } from './constants';
import type { FieldsDictionary, RegleInstance } from './types';
import { getPriorityProperties, getRemainingProperties, parseFieldNodeId, parseRuleNodeId } from './utils';

/**
 * Build state for a field node
 */
function buildFieldState(fieldStatus: $InternalRegleFieldStatus): CustomInspectorState {
  const state: CustomInspectorState = {};

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

  return state;
}

/**
 * Build state for a rule node
 */
function buildRuleState(ruleStatus: $InternalRegleRuleStatus): CustomInspectorState {
  const state: CustomInspectorState = {};

  const ruleKeys = ['$type', '$valid', '$active', '$pending', '$message', '$tooltip'];
  const priorityProperties = getPriorityProperties(ruleStatus, ruleKeys);
  if (priorityProperties.length > 0) {
    state['Rule State'] = priorityProperties;
  }

  // Add params if present
  if (ruleStatus.$params && Array.isArray(ruleStatus.$params) && ruleStatus.$params.length > 0) {
    state['Parameters'] = [
      {
        key: '$params',
        value: ruleStatus.$params,
        editable: false,
      },
    ];
  }

  // Add metadata if present
  if (ruleStatus.$metadata !== undefined && ruleStatus.$metadata !== true && ruleStatus.$metadata !== false) {
    state['Metadata'] = [
      {
        key: '$metadata',
        value: ruleStatus.$metadata,
        objectType: 'reactive',
        editable: false,
      },
    ];
  }

  // Remaining properties
  const remainingProperties = getRemainingProperties(ruleStatus, [
    ...ruleKeys,
    '$params',
    '$metadata',
    '$haveAsync',
    '$validating',
    '$fieldDirty',
    '$fieldInvalid',
    '$fieldPending',
    '$fieldCorrect',
    '$fieldError',
    '$maybePending',
    '$externalErrors',
  ]);
  if (remainingProperties.length > 0) {
    state['Other Properties'] = remainingProperties;
  }

  return state;
}

function buildRootState(r$: SuperCompatibleRegleRoot): CustomInspectorState {
  const state: CustomInspectorState = {};

  const priorityProperties = getPriorityProperties(r$, PRIORITY_KEYS.ROOT);
  if (priorityProperties.length > 0) {
    state['State'] = priorityProperties;
  }

  const remainingProperties = getRemainingProperties(r$, [...PRIORITY_KEYS.ROOT, '$fields']);
  if (remainingProperties.length > 0) {
    state['Other Properties'] = remainingProperties;
  }

  if (r$['~modifiers']) {
    state['Modifiers'] = Object.entries(r$['~modifiers']).map(([key, value]) => ({
      key,
      value,
      editable: false,
    }));
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
): CustomInspectorState | null {
  const ruleInfo = parseRuleNodeId(nodeId);
  if (ruleInfo) {
    const { instanceId, fieldName, ruleName } = ruleInfo;
    const instance = getInstance(instanceId);

    if (!instance || !instance.r$.$fields) return null;

    const fieldStatus = resolveFieldByPath(instance.r$.$fields, fieldName);
    if (!fieldStatus || !('$rules' in fieldStatus)) return null;

    const fieldWithRules = fieldStatus as $InternalRegleFieldStatus;
    const ruleStatus = fieldWithRules.$rules[ruleName];
    if (!ruleStatus) return null;

    return buildRuleState(ruleStatus);
  }

  const fieldInfo = parseFieldNodeId(nodeId);
  if (fieldInfo) {
    const { instanceId, fieldName } = fieldInfo;
    const instance = getInstance(instanceId);

    if (!instance || !instance.r$.$fields) return null;

    const fieldStatus = resolveFieldByPath(instance.r$.$fields, fieldName);
    if (!fieldStatus) return null;

    return buildFieldState(fieldStatus as any);
  }

  const instance = getInstance(nodeId);
  if (!instance) return null;

  return buildRootState(instance.r$);
}
