import { Ref, computed } from 'vue';
import {
  PossibleRegleErrors,
  $InternalRegleStatusType,
  $InternalRegleStatus,
  $InternalRegleRuleStatus,
  $InternalRegleCollectionStatus,
} from '../../types';
import { isCollectionRulesStatus, isFieldStatus, isNestedRulesStatus } from './guards';

function extractRulesErrors(rules: Record<string, $InternalRegleRuleStatus>): string[] {
  return Object.entries(rules)
    .map(([ruleKey, rule]) => {
      if (!rule.$valid) {
        return rule.$message;
      }
      return null;
    })
    .filter((msg): msg is string => !!msg);
}

function processFieldErrors(fieldStatus: $InternalRegleStatusType): PossibleRegleErrors {
  if (isNestedRulesStatus(fieldStatus)) {
    return extractNestedErrors(fieldStatus.$fields);
  } else if (isCollectionRulesStatus(fieldStatus)) {
    return {
      $errors: fieldStatus.$rules ? extractRulesErrors(fieldStatus.$rules) : [],
      $each: fieldStatus.$each.map(processFieldErrors),
    };
  } else if (isFieldStatus(fieldStatus) && fieldStatus.$error) {
    return extractRulesErrors(fieldStatus.$rules);
  }
  return [];
}

function extractCollectionError(field: $InternalRegleCollectionStatus): PossibleRegleErrors[] {
  return field.$each.map(processFieldErrors);
}

function extractNestedErrors(
  fields: Record<string, $InternalRegleStatusType> | $InternalRegleStatusType[]
): Record<string, PossibleRegleErrors> {
  return Object.fromEntries(
    Object.entries(fields).map(([fieldKey, fieldStatus]) => {
      if (isNestedRulesStatus(fieldStatus)) {
        return [fieldKey, extractNestedErrors(fieldStatus.$fields)];
      } else if (isCollectionRulesStatus(fieldStatus)) {
        return [
          fieldKey,
          {
            ...(fieldStatus.$rules && { $errors: extractRulesErrors(fieldStatus.$rules) }),
            $each: extractCollectionError(fieldStatus),
          },
        ];
      } else if (isFieldStatus(fieldStatus) && fieldStatus.$error) {
        return [fieldKey, extractRulesErrors(fieldStatus.$rules)];
      }
      return [fieldKey, []];
    })
  );
}

export function useErrors($regle: $InternalRegleStatus) {
  const errors = computed(() => {
    return extractNestedErrors($regle.$fields);
  });

  return errors;
}
