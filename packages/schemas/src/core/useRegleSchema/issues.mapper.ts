import type { RegleFieldIssue } from '@regle/core';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { Ref } from 'vue';
import { getDotPath, isObject, setObjectError } from '../../../../shared';
import { getIssueLastPathKey, getIssuePath, getParentArrayPath, getPropertiesFromIssue } from './path.utils';

export type SchemaIssueWithArrayValue = StandardSchemaV1.Issue & { $currentArrayValue?: any };

export function filterIssues(
  issues: readonly SchemaIssueWithArrayValue[],
  previousIssues: Ref<readonly SchemaIssueWithArrayValue[]>,
  rewardEarly: boolean | undefined,
  isValidate = false
): readonly StandardSchemaV1.Issue[] {
  if (!isValidate && rewardEarly) {
    if (previousIssues.value.length) {
      const remappedPreviousIssues = previousIssues.value.reduce((acc, prevIssue) => {
        if (
          '$currentArrayValue' in prevIssue &&
          isObject(prevIssue.$currentArrayValue) &&
          '$id' in prevIssue.$currentArrayValue
        ) {
          const previousItemId = prevIssue.$currentArrayValue.$id;
          const previousLastPathKey = getIssueLastPathKey(prevIssue);
          const previousArrayIssue = issues.find(
            (currentIssue) =>
              currentIssue?.$currentArrayValue?.['$id'] === previousItemId &&
              getIssueLastPathKey(currentIssue) === previousLastPathKey
          );
          if (previousArrayIssue) {
            acc.push({ ...prevIssue, path: previousArrayIssue?.path ?? [] });
          }
        } else if (issues.some((issue) => getIssuePath(issue) === getIssuePath(prevIssue))) {
          acc.push(prevIssue);
        }

        return acc;
      }, [] as StandardSchemaV1.Issue[]);

      return remappedPreviousIssues;
    }

    return [];
  }

  return issues;
}

export function mapSingleFieldIssues(
  issues: readonly StandardSchemaV1.Issue[],
  previousIssues: Ref<readonly SchemaIssueWithArrayValue[]>,
  rewardEarly: boolean | undefined,
  isValidate = false
) {
  const filteredIssues = filterIssues(
    issues as readonly SchemaIssueWithArrayValue[],
    previousIssues,
    rewardEarly,
    isValidate
  );
  return (filteredIssues?.map((issue) => ({
    $message: issue.message,
    $property: issue.path?.[issue.path.length - 1]?.toString() ?? '-',
    $rule: 'schema',
    ...issue,
  })) ?? []) as RegleFieldIssue[];
}

export function issuesToRegleErrors({
  result,
  previousIssues,
  processedState,
  rewardEarly,
  isValidate = false,
}: {
  result: StandardSchemaV1.Result<unknown>;
  previousIssues: Ref<readonly SchemaIssueWithArrayValue[]>;
  processedState: Ref<Record<string, any>>;
  rewardEarly: boolean | undefined;
  isValidate?: boolean;
}) {
  const output = {};

  const mappedIssues = result.issues?.map((issue) => {
    const parentArrayPath = getParentArrayPath(issue);
    if (parentArrayPath) {
      const $currentArrayValue = getDotPath(processedState.value, getIssuePath(parentArrayPath));
      Object.defineProperty(issue, '$currentArrayValue', {
        value: $currentArrayValue,
        enumerable: true,
        configurable: true,
        writable: true,
      });
    }

    return issue;
  });

  const filteredIssues = filterIssues(
    (mappedIssues ?? []) as readonly SchemaIssueWithArrayValue[],
    previousIssues,
    rewardEarly,
    isValidate
  );

  if (mappedIssues?.length) {
    const issues = filteredIssues.map((issue) => {
      const { isArray, $path, lastItemKey } = getPropertiesFromIssue(issue, processedState);

      return {
        ...issue,
        $path,
        isArray,
        $property: lastItemKey,
        $rule: 'schema',
        $message: issue.message,
      };
    });

    issues.forEach(({ isArray, $path, ...issue }) => {
      setObjectError(output, $path, [issue], isArray);
    });

    previousIssues.value = issues;
  } else {
    previousIssues.value = [];
  }

  return output;
}
