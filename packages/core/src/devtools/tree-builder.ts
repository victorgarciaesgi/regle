import type { SuperCompatibleRegleRoot } from '../types';
import { COLORS } from './constants';
import type { RegleInstance } from './registry';
import type { InspectorNodeTag, InspectorTreeNode } from './types';
import { createFieldNodeId } from './utils';

/**
 * Build tags for a root instance based on validation state
 */
function buildRootInstanceTags(r$: SuperCompatibleRegleRoot, componentName?: string): InspectorNodeTag[] {
  const tags: InspectorNodeTag[] = [];
  const isValid = !r$.$invalid;
  const hasErrors = r$.$error;

  if (hasErrors) {
    tags.push({
      label: 'error',
      textColor: COLORS.ERROR.text,
      backgroundColor: COLORS.ERROR.bg,
    });
  } else if (isValid && r$.$dirty) {
    tags.push({
      label: 'valid',
      textColor: COLORS.VALID.text,
      backgroundColor: COLORS.VALID.bg,
    });
  } else if (r$.$pending) {
    tags.push({
      label: 'pending',
      textColor: COLORS.PENDING.text,
      backgroundColor: COLORS.PENDING.bg,
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

/**
 * Build tags for a field based on validation state
 */
function buildFieldTags(fieldStatus: any): InspectorNodeTag[] {
  const tags: InspectorNodeTag[] = [];

  if (fieldStatus.$error) {
    tags.push({
      label: 'error',
      textColor: COLORS.ERROR.text,
      backgroundColor: COLORS.ERROR.bg,
    });
  } else if (!fieldStatus.$invalid && fieldStatus.$dirty) {
    tags.push({
      label: 'valid',
      textColor: COLORS.VALID.text,
      backgroundColor: COLORS.VALID.bg,
    });
  }

  if (fieldStatus.$pending) {
    tags.push({
      label: 'pending',
      textColor: COLORS.PENDING.text,
      backgroundColor: COLORS.PENDING.bg,
    });
  }

  if (fieldStatus.$dirty) {
    tags.push({
      label: 'dirty',
      textColor: COLORS.DIRTY.text,
      backgroundColor: COLORS.DIRTY.bg,
    });
  }

  return tags;
}

/**
 * Check if a field is a collection (array)
 */
function isCollection(fieldStatus: any): boolean {
  return fieldStatus && typeof fieldStatus === 'object' && '$each' in fieldStatus;
}

/**
 * Build child nodes for collection items
 */
function buildCollectionItemNodes(fieldStatus: any, instanceId: string, fieldPath: string): InspectorTreeNode[] {
  const children: InspectorTreeNode[] = [];

  if (!fieldStatus.$each || !Array.isArray(fieldStatus.$each)) {
    return children;
  }

  fieldStatus.$each.forEach((item: any, index: number) => {
    if (item && typeof item === 'object') {
      const itemTags = buildFieldTags(item);
      const itemPath = `${fieldPath}[${index}]`;

      // Check if item has nested fields
      const hasNestedFields = item.$fields && typeof item.$fields === 'object';
      let itemChildren: InspectorTreeNode[] = [];

      if (hasNestedFields) {
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

/**
 * Build child nodes for nested fields
 */
function buildNestedFieldNodes(fields: any, instanceId: string, parentPath: string): InspectorTreeNode[] {
  const children: InspectorTreeNode[] = [];

  Object.entries(fields).forEach(([fieldName, fieldStatus]: [string, any]) => {
    if (fieldStatus && typeof fieldStatus === 'object') {
      const fieldPath = parentPath ? `${parentPath}.${fieldName}` : fieldName;
      const fieldTags = buildFieldTags(fieldStatus);

      let fieldChildren: InspectorTreeNode[] = [];

      // Check if this field is a collection
      if (isCollection(fieldStatus)) {
        fieldChildren = buildCollectionItemNodes(fieldStatus, instanceId, fieldPath);
      }
      // Check if this field has nested fields
      else if (fieldStatus.$fields && typeof fieldStatus.$fields === 'object') {
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

/**
 * Build child nodes for fields
 */
function buildFieldNodes(r$: SuperCompatibleRegleRoot, instanceId: string): InspectorTreeNode[] {
  const children: InspectorTreeNode[] = [];

  if (!r$.$fields || typeof r$.$fields !== 'object') {
    return children;
  }

  Object.entries(r$.$fields).forEach(([fieldName, fieldStatus]: [string, any]) => {
    if (fieldStatus && typeof fieldStatus === 'object') {
      const fieldTags = buildFieldTags(fieldStatus);
      let fieldChildren: InspectorTreeNode[] = [];

      // Check if this field is a collection
      if (isCollection(fieldStatus)) {
        fieldChildren = buildCollectionItemNodes(fieldStatus, instanceId, fieldName);
      }
      // Check if this field has nested fields
      else if (fieldStatus.$fields && typeof fieldStatus.$fields === 'object') {
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

/**
 * Build the inspector tree from all Regle instances
 */
export function buildInspectorTree(instances: RegleInstance[]): InspectorTreeNode[] {
  return instances.map((instance) => {
    const { r$, id, name, componentName } = instance;
    const tags = buildRootInstanceTags(r$, componentName);
    const children = buildFieldNodes(r$, id);

    return {
      id,
      label: name,
      tags,
      children: children.length > 0 ? children : undefined,
    };
  });
}
