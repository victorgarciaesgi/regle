import type { CustomInspectorNode, InspectorNodeTag } from '@vue/devtools-kit';
import { isCollectionRulesStatus, isFieldStatus, isNestedRulesStatus } from '../core/useRegle/guards';
import type {
  $InternalRegleCollectionStatus,
  $InternalRegleFieldStatus,
  $InternalRegleRuleStatus,
  $InternalRegleStatusType,
  SuperCompatibleRegleRoot,
} from '../types';
import { COLORS, TOOLTIP_LABELS_FIELDS, TOOLTIP_LABELS_NESTED, TOOLTIP_LABELS_RULES } from './constants';
import type { FieldsDictionary, RegleInstance } from './types';
import { createFieldNodeId, createRuleNodeId } from './utils';
import { isEmpty } from '../../../shared';

function buildNodeTags(
  fieldOrR$: $InternalRegleStatusType | SuperCompatibleRegleRoot,
  componentName?: string
): InspectorNodeTag[] {
  const tags: InspectorNodeTag[] = [];

  const isOptional = isFieldStatus(fieldOrR$)
    ? (('required' in fieldOrR$.$rules && !fieldOrR$.$rules.required.$active) || isEmpty(fieldOrR$.$rules)) &&
      !fieldOrR$.$schemaMode
    : false;

  const isNestedOrCollection = isNestedRulesStatus(fieldOrR$) || isCollectionRulesStatus(fieldOrR$);

  if (fieldOrR$.$error) {
    tags.push({
      label: 'error',
      textColor: COLORS.ERROR.text,
      backgroundColor: COLORS.ERROR.bg,
      tooltip: isNestedOrCollection ? TOOLTIP_LABELS_NESTED.ERROR : TOOLTIP_LABELS_FIELDS.ERROR,
    });
  } else if (fieldOrR$.$correct) {
    tags.push({
      label: 'correct',
      textColor: COLORS.CORRECT.text,
      backgroundColor: COLORS.CORRECT.bg,
      tooltip: isNestedOrCollection ? TOOLTIP_LABELS_NESTED.CORRECT : TOOLTIP_LABELS_FIELDS.CORRECT,
    });
  }

  if (fieldOrR$.$pending) {
    tags.push({
      label: 'pending',
      textColor: COLORS.PENDING.text,
      backgroundColor: COLORS.PENDING.bg,
      tooltip: isNestedOrCollection ? TOOLTIP_LABELS_NESTED.PENDING : TOOLTIP_LABELS_FIELDS.PENDING,
    });
  }

  if (isOptional) {
    tags.push({
      label: 'optional',
      textColor: COLORS.OPTIONAL.text,
      backgroundColor: COLORS.OPTIONAL.bg,
      tooltip: TOOLTIP_LABELS_FIELDS.OPTIONAL,
    });

    if (!fieldOrR$.$invalid && fieldOrR$.$dirty) {
      tags.push({
        label: 'valid',
        textColor: COLORS.VALID.text,
        backgroundColor: COLORS.VALID.bg,
        tooltip: TOOLTIP_LABELS_FIELDS.VALID,
      });
    }
  }

  if (fieldOrR$.$dirty) {
    tags.push({
      label: 'dirty',
      textColor: COLORS.DIRTY.text,
      backgroundColor: COLORS.DIRTY.bg,
      tooltip: isNestedOrCollection ? TOOLTIP_LABELS_NESTED.DIRTY : TOOLTIP_LABELS_FIELDS.DIRTY,
    });
  } else if (!isOptional) {
    tags.push({
      label: 'pristine',
      textColor: COLORS.PRISTINE.text,
      backgroundColor: COLORS.PRISTINE.bg,
      tooltip: TOOLTIP_LABELS_FIELDS.PRISTINE,
    });
  }

  if (componentName) {
    tags.push({
      label: `<${componentName}.vue>`,
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
      textColor: COLORS.INACTIVE.text,
      backgroundColor: COLORS.INACTIVE.bg,
      tooltip: TOOLTIP_LABELS_RULES.INACTIVE,
    });
  } else if (!rule.$valid) {
    tags.push({
      label: 'invalid',
      textColor: COLORS.INVALID.text,
      backgroundColor: COLORS.INVALID.bg,
      tooltip: TOOLTIP_LABELS_RULES.INVALID,
    });
  } else if (rule.$valid) {
    tags.push({
      label: 'valid',
      textColor: COLORS.VALID.text,
      backgroundColor: COLORS.VALID.bg,
      tooltip: TOOLTIP_LABELS_RULES.VALID,
    });
  }

  if (rule.$pending) {
    tags.push({
      label: 'pending',
      textColor: COLORS.PENDING.text,
      backgroundColor: COLORS.PENDING.bg,
      tooltip: TOOLTIP_LABELS_RULES.PENDING,
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
        label: `⚙️ ${ruleName}`,
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

  if (fieldStatus.$self && typeof fieldStatus.$self === 'object') {
    const itemTags = buildNodeTags(fieldStatus.$self);
    const itemPath = `${fieldPath}[$self]`;

    children.unshift({
      id: createFieldNodeId(instanceId, itemPath),
      label: '$self',
      tags: itemTags,
      children: buildRuleNodes(fieldStatus.$self, instanceId, itemPath),
    });
  }

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
      let isCollection = false;
      let isEmptyCollection = false;

      let fieldChildren: CustomInspectorNode[] = [];

      if (isCollectionRulesStatus(fieldStatus)) {
        fieldChildren = buildCollectionItemNodes(fieldStatus, instanceId, fieldPath);
        isCollection = true;
        if (fieldChildren.length === 0) {
          isEmptyCollection = true;
        }
      } else if (isNestedRulesStatus(fieldStatus)) {
        fieldChildren = buildNestedFieldNodes(
          {
            ...fieldStatus.$fields,
            $self: fieldStatus.$self,
          },
          instanceId,
          fieldPath
        );
      } else if (isFieldStatus(fieldStatus)) {
        fieldChildren = buildRuleNodes(fieldStatus, instanceId, fieldPath);
      }

      const filteredChildren = fieldChildren.filter((child) => child.label !== '$self');

      children.push({
        id: createFieldNodeId(instanceId, fieldPath),
        label: `${isCollection ? `${fieldName}[${filteredChildren.length}]` : fieldName}${isEmptyCollection ? ' (empty)' : ''}`,
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

  if (!('$fields' in r$) || typeof r$.$fields !== 'object') {
    return children;
  }

  Object.entries(r$.$fields).forEach(([fieldName, fieldStatus]: [string, $InternalRegleStatusType]) => {
    if (fieldStatus && typeof fieldStatus === 'object') {
      const fieldTags = buildNodeTags(fieldStatus);
      let fieldChildren: CustomInspectorNode[] = [];
      let isCollection = false;

      if (isCollectionRulesStatus(fieldStatus)) {
        fieldChildren = buildCollectionItemNodes(fieldStatus, instanceId, fieldName);
        isCollection = true;
      } else if (isNestedRulesStatus(fieldStatus)) {
        fieldChildren = buildNestedFieldNodes(
          {
            ...fieldStatus.$fields,
            $self: fieldStatus.$self,
          },
          instanceId,
          fieldName
        );
      } else if (isFieldStatus(fieldStatus)) {
        fieldChildren = buildRuleNodes(fieldStatus, instanceId, fieldName);
      }

      const filteredChildren = fieldChildren.filter((child) => child.label !== '$self');

      children.push({
        id: createFieldNodeId(instanceId, fieldName),
        label: `${isCollection ? `${fieldName}[${filteredChildren.length}]` : fieldName}`,
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
