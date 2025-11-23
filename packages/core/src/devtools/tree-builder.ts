import type { CustomInspectorNode, InspectorNodeTag } from '@vue/devtools-kit';
import { isCollectionRulesStatus, isFieldStatus, isNestedRulesStatus } from '../core/useRegle/guards';
import type {
  $InternalRegleCollectionStatus,
  $InternalRegleFieldStatus,
  $InternalRegleRuleStatus,
  $InternalRegleStatusType,
  SuperCompatibleRegleRoot,
} from '../types';
import { COLORS } from './constants';
import type { FieldsDictionary, RegleInstance } from './types';
import { createFieldNodeId, createRuleNodeId } from './utils';

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

  if (fieldOrR$.$dirty) {
    tags.push({
      label: 'dirty',
      textColor: COLORS.DIRTY.text,
      backgroundColor: COLORS.DIRTY.bg,
    });
  } else if ('$rules' in fieldOrR$) {
    tags.push({
      label: 'pristine',
      textColor: COLORS.PRISTINE.text,
      backgroundColor: COLORS.PRISTINE.bg,
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

function buildRuleTags(rule: $InternalRegleRuleStatus): InspectorNodeTag[] {
  const tags: InspectorNodeTag[] = [];

  if (!rule.$active) {
    tags.push({
      label: 'inactive',
      textColor: 0x9ca3af,
      backgroundColor: 0xf3f4f6,
    });
  } else if (!rule.$valid) {
    tags.push({
      label: 'invalid',
      textColor: COLORS.INVALID.text,
      backgroundColor: COLORS.INVALID.bg,
    });
  } else if (rule.$valid) {
    tags.push({
      label: 'valid',
      textColor: COLORS.VALID.text,
      backgroundColor: COLORS.VALID.bg,
    });
  }

  if (rule.$pending) {
    tags.push({
      label: 'pending',
      textColor: COLORS.PENDING.text,
      backgroundColor: COLORS.PENDING.bg,
    });
  }

  return tags;
}

function buildRuleNodes(
  fieldStatus: $InternalRegleFieldStatus,
  instanceId: string,
  fieldPath: string
): CustomInspectorNode[] {
  const children: CustomInspectorNode[] = [];

  if (!fieldStatus.$rules || typeof fieldStatus.$rules !== 'object') {
    return children;
  }

  Object.entries(fieldStatus.$rules).forEach(([ruleName, ruleStatus]) => {
    if (ruleStatus && typeof ruleStatus === 'object') {
      const ruleTags = buildRuleTags(ruleStatus);

      children.push({
        id: createRuleNodeId(instanceId, fieldPath, ruleName),
        label: ruleName,
        tags: ruleTags,
        children: [],
      });
    }
  });

  return children;
}

function buildCollectionItemNodes(
  fieldStatus: $InternalRegleCollectionStatus,
  instanceId: string,
  fieldPath: string
): CustomInspectorNode[] {
  const children: CustomInspectorNode[] = [];

  if (!fieldStatus.$each || !Array.isArray(fieldStatus.$each)) {
    return children;
  }

  fieldStatus.$each.forEach((item, index) => {
    if (item && typeof item === 'object') {
      const itemTags = buildNodeTags(item);
      const itemPath = `${fieldPath}[${index}]`;
      let itemChildren: CustomInspectorNode[] = [];

      if (isNestedRulesStatus(item)) {
        itemChildren = buildNestedFieldNodes(item.$fields, instanceId, itemPath);
      } else if (isFieldStatus(item)) {
        itemChildren = buildRuleNodes(item, instanceId, itemPath);
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

function buildNestedFieldNodes(
  fields: FieldsDictionary,
  instanceId: string,
  parentPath: string
): CustomInspectorNode[] {
  const children: CustomInspectorNode[] = [];

  Object.entries(fields).forEach(([fieldName, fieldStatus]) => {
    if (fieldStatus && typeof fieldStatus === 'object') {
      const fieldPath = parentPath ? `${parentPath}.${fieldName}` : fieldName;
      const fieldTags = buildNodeTags(fieldStatus);

      let fieldChildren: CustomInspectorNode[] = [];

      if (isCollectionRulesStatus(fieldStatus)) {
        fieldChildren = buildCollectionItemNodes(fieldStatus, instanceId, fieldPath);
      } else if (isNestedRulesStatus(fieldStatus)) {
        fieldChildren = buildNestedFieldNodes(fieldStatus.$fields, instanceId, fieldPath);
      } else if (isFieldStatus(fieldStatus)) {
        fieldChildren = buildRuleNodes(fieldStatus, instanceId, fieldPath);
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

function buildRootChildrenNodes(
  r$: SuperCompatibleRegleRoot | $InternalRegleFieldStatus,
  instanceId: string
): CustomInspectorNode[] {
  const children: CustomInspectorNode[] = [];

  if (isFieldStatus(r$)) {
    return buildRuleNodes(r$, instanceId, 'root');
  }

  if (!r$.$fields || typeof r$.$fields !== 'object') {
    return children;
  }

  Object.entries(r$.$fields).forEach(([fieldName, fieldStatus]: [string, $InternalRegleStatusType]) => {
    if (fieldStatus && typeof fieldStatus === 'object') {
      const fieldTags = buildNodeTags(fieldStatus);
      let fieldChildren: CustomInspectorNode[] = [];

      if (isCollectionRulesStatus(fieldStatus)) {
        fieldChildren = buildCollectionItemNodes(fieldStatus, instanceId, fieldName);
      } else if (isNestedRulesStatus(fieldStatus)) {
        fieldChildren = buildNestedFieldNodes(fieldStatus.$fields, instanceId, fieldName);
      } else if (isFieldStatus(fieldStatus)) {
        fieldChildren = buildRuleNodes(fieldStatus, instanceId, fieldName);
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

export function buildInspectorTree(instances: RegleInstance[], filter?: string): CustomInspectorNode[] {
  const nodes: CustomInspectorNode[] = instances.map((instance) => {
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

  if (!filter || filter.trim() === '') {
    return nodes;
  }

  return filterInspectorTree(nodes, filter);
}

function filterInspectorTree(nodes: CustomInspectorNode[], filter: string): CustomInspectorNode[] {
  const lowerFilter = filter.toLowerCase();
  const filtered: CustomInspectorNode[] = [];

  for (const node of nodes) {
    const labelMatches = node.label.toLowerCase().includes(lowerFilter);
    const tagMatches = node.tags?.some((tag) => tag.label.toLowerCase().includes(lowerFilter)) ?? false;

    const filteredChildren = node.children ? filterInspectorTree(node.children, filter) : [];

    if (labelMatches || tagMatches || filteredChildren.length > 0) {
      filtered.push({
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children,
      });
    }
  }

  return filtered;
}
