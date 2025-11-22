import { isCollectionRulesStatus, isNestedRulesStatus } from '../core/useRegle/guards';
import type { $InternalRegleCollectionStatus, $InternalRegleStatusType, SuperCompatibleRegleRoot } from '../types';
import { COLORS } from './constants';
import type { RegleInstance } from './registry';
import type { FieldsDictionary, InspectorNodeTag, InspectorTreeNode } from './types';
import { createFieldNodeId } from './utils';

function buildNodeTags(
  fieldOrR$: $InternalRegleStatusType | SuperCompatibleRegleRoot,
  componentName?: string
): InspectorNodeTag[] {
  const tags: InspectorNodeTag[] = [];

  if (fieldOrR$.$error) {
    tags.push({
      label: 'error',
      textColor: COLORS.ERROR.text,
      backgroundColor: COLORS.ERROR.bg,
    });
  } else if (fieldOrR$.$correct) {
    tags.push({
      label: 'correct',
      textColor: COLORS.VALID.text,
      backgroundColor: COLORS.VALID.bg,
    });
  }

  if (fieldOrR$.$pending) {
    tags.push({
      label: 'pending',
      textColor: COLORS.PENDING.text,
      backgroundColor: COLORS.PENDING.bg,
    });
  }

  if (!('$fields' in fieldOrR$) && fieldOrR$.$dirty) {
    tags.push({
      label: 'dirty',
      textColor: COLORS.DIRTY.text,
      backgroundColor: COLORS.DIRTY.bg,
    });
  }

  if (componentName) {
    tags.push({
      label: componentName,
      textColor: COLORS.COMPONENT.text,
      backgroundColor: COLORS.COMPONENT.bg,
    });
  }

  return tags;
}

function buildCollectionItemNodes(
  fieldStatus: $InternalRegleCollectionStatus,
  instanceId: string,
  fieldPath: string
): InspectorTreeNode[] {
  const children: InspectorTreeNode[] = [];

  if (!fieldStatus.$each || !Array.isArray(fieldStatus.$each)) {
    return children;
  }

  fieldStatus.$each.forEach((item, index) => {
    if (item && typeof item === 'object') {
      const itemTags = buildNodeTags(item);
      const itemPath = `${fieldPath}[${index}]`;
      let itemChildren: InspectorTreeNode[] = [];

      if (isNestedRulesStatus(item)) {
        itemChildren = buildNestedFieldNodes(item.$fields, instanceId, itemPath);
      }

      children.push({
        id: createFieldNodeId(instanceId, itemPath),
        label: `[${index}]`,
        tags: itemTags,
        children: itemChildren,
      });
    }
  });

  return children;
}

function buildNestedFieldNodes(fields: FieldsDictionary, instanceId: string, parentPath: string): InspectorTreeNode[] {
  const children: InspectorTreeNode[] = [];

  Object.entries(fields).forEach(([fieldName, fieldStatus]) => {
    if (fieldStatus && typeof fieldStatus === 'object') {
      const fieldPath = parentPath ? `${parentPath}.${fieldName}` : fieldName;
      const fieldTags = buildNodeTags(fieldStatus);

      let fieldChildren: InspectorTreeNode[] = [];

      if (isCollectionRulesStatus(fieldStatus)) {
        fieldChildren = buildCollectionItemNodes(fieldStatus, instanceId, fieldPath);
      } else if (isNestedRulesStatus(fieldStatus)) {
        fieldChildren = buildNestedFieldNodes(fieldStatus.$fields, instanceId, fieldPath);
      }

      children.push({
        id: createFieldNodeId(instanceId, fieldPath),
        label: fieldName,
        tags: fieldTags,
        children: fieldChildren,
      });
    }
  });

  return children;
}

function buildRootChildrenNodes(r$: SuperCompatibleRegleRoot, instanceId: string): InspectorTreeNode[] {
  const children: InspectorTreeNode[] = [];

  if (!r$.$fields || typeof r$.$fields !== 'object') {
    return children;
  }

  Object.entries(r$.$fields).forEach(([fieldName, fieldStatus]: [string, $InternalRegleStatusType]) => {
    if (fieldStatus && typeof fieldStatus === 'object') {
      const fieldTags = buildNodeTags(fieldStatus);
      let fieldChildren: InspectorTreeNode[] = [];

      if (isCollectionRulesStatus(fieldStatus)) {
        fieldChildren = buildCollectionItemNodes(fieldStatus, instanceId, fieldName);
      } else if (isNestedRulesStatus(fieldStatus)) {
        fieldChildren = buildNestedFieldNodes(fieldStatus.$fields, instanceId, fieldName);
      }

      children.push({
        id: createFieldNodeId(instanceId, fieldName),
        label: fieldName,
        tags: fieldTags,
        children: fieldChildren,
      });
    }
  });

  return children;
}

export function buildInspectorTree(instances: RegleInstance[]): InspectorTreeNode[] {
  return instances.map((instance) => {
    const { r$, id, name, componentName } = instance;
    const tags = buildNodeTags(r$, componentName);
    const children = buildRootChildrenNodes(r$, id);

    return {
      id,
      label: name,
      tags,
      children,
    };
  });
}
