import { computed } from 'vue';
import type {
  $InternalRegleCollectionStatus,
  $InternalRegleErrors,
  $InternalRegleFieldStatus,
  $InternalRegleRuleStatus,
  $InternalRegleStatus,
  $InternalRegleStatusType,
} from '../../types';
import { isCollectionRulesStatus, isFieldStatus, isNestedRulesStatus } from './guards';

export function extractRulesErrors({
  field,
  silent = false,
}: {
  field: Pick<$InternalRegleFieldStatus, '$rules' | '$dirty' | '$externalErrors'>;
  silent?: boolean;
}): string[] {
  return Object.entries(field.$rules ?? {})
    .map(([ruleKey, rule]) => {
      if (silent) {
        return rule.$message;
      } else if (!rule.$valid && field.$dirty && !rule.$validating) {
        return rule.$message;
      }

      return null;
    })
    .filter((msg): msg is string | string[] => !!msg)
    .reduce<string[]>((acc, value) => {
      if (typeof value === 'string') {
        return acc?.concat([value]);
      } else {
        return acc?.concat(value);
      }
    }, [])
    .concat(field.$externalErrors ?? []);
}

function processFieldErrors(
  fieldStatus: $InternalRegleStatusType,
  silent = false
): $InternalRegleErrors {
  if (isNestedRulesStatus(fieldStatus)) {
    return extractNestedErrors(fieldStatus.$fields);
  } else if (isCollectionRulesStatus(fieldStatus)) {
    return {
      $errors: fieldStatus.$field.$rules
        ? extractRulesErrors({ field: fieldStatus.$field, silent })
        : [],
      $each: fieldStatus.$each.map((field) => processFieldErrors(field, silent)),
    };
  } else if (isFieldStatus(fieldStatus)) {
    if (fieldStatus.$error) {
      return extractRulesErrors({
        field: fieldStatus,
        silent,
      });
    } else {
      return fieldStatus.$externalErrors ?? [];
    }
  }
  return [];
}

export function extractCollectionError(
  each: $InternalRegleStatusType[],
  silent = false
): $InternalRegleErrors[] {
  return each.map((field) => processFieldErrors(field, silent));
}

export function extractNestedErrors(
  fields: Record<string, $InternalRegleStatusType> | $InternalRegleStatusType[],
  silent = false
): Record<string, $InternalRegleErrors> {
  return Object.fromEntries(
    Object.entries(fields).map(([fieldKey, fieldStatus]) => {
      if (isNestedRulesStatus(fieldStatus)) {
        return [fieldKey, extractNestedErrors(fieldStatus.$fields, silent)];
      } else if (isCollectionRulesStatus(fieldStatus)) {
        return [
          fieldKey,
          {
            $errors: extractRulesErrors({ field: fieldStatus.$field, silent }),
            $each: extractCollectionError(fieldStatus.$each, silent),
          },
        ];
      } else if (isFieldStatus(fieldStatus)) {
        if (fieldStatus.$error) {
          return [
            fieldKey,
            extractRulesErrors({
              field: fieldStatus,
              silent,
            }),
          ];
        } else {
          return [fieldKey, fieldStatus.$externalErrors ?? []];
        }
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
