import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { Ref } from 'vue';
import { getDotPath } from '../../../../shared';

export function getIssuePath(issue: StandardSchemaV1.Issue) {
  return issue.path?.map((item) => (typeof item === 'object' ? item.key : item.toString())).join('.') ?? '';
}

export function getIssueLastPathKey(issue: StandardSchemaV1.Issue) {
  const lastItem = issue.path?.at(-1);
  return typeof lastItem === 'object' ? lastItem.key : lastItem;
}

export function getParentArrayPath(issue: StandardSchemaV1.Issue) {
  const lastItem = issue.path?.at(-1);
  const isNestedPath = typeof lastItem === 'object' ? typeof lastItem.key === 'string' : typeof lastItem === 'string';
  const index = issue.path?.findLastIndex((item) =>
    typeof item === 'object' ? typeof item.key === 'number' : typeof item === 'number'
  );

  if (!isNestedPath && index === -1) {
    return undefined;
  }

  if (index != null) {
    const truncatedPath = issue.path?.slice(0, index + 1);
    return { ...issue, path: truncatedPath };
  }

  return undefined;
}

export function getPropertiesFromIssue(issue: StandardSchemaV1.Issue, processedState: Ref<Record<string, any>>) {
  const $path = getIssuePath(issue);
  const lastItem = issue.path?.[issue.path.length - 1];
  const lastItemKey = typeof lastItem === 'object' ? lastItem.key : lastItem;
  const isArray =
    (typeof lastItem === 'object' && 'value' in lastItem ? Array.isArray(lastItem.value) : false) ||
    ('type' in issue ? issue.type === 'array' : false) ||
    Array.isArray(getDotPath(processedState.value, $path));

  return { isArray, $path, lastItemKey, lastItem };
}
