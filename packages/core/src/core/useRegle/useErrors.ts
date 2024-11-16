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
      } else if (!rule.$valid && field.$dirty) {
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

function processFieldErrors(fieldStatus: $InternalRegleStatusType): $InternalRegleErrors {
  if (isNestedRulesStatus(fieldStatus)) {
    return extractNestedErrors(fieldStatus.$fields);
  } else if (isCollectionRulesStatus(fieldStatus)) {
    return {
      $errors: fieldStatus.$field.$rules ? extractRulesErrors({ field: fieldStatus.$field }) : [],
      $each: fieldStatus.$each.map(processFieldErrors),
    };
  } else if (isFieldStatus(fieldStatus)) {
    if (fieldStatus.$error) {
      return extractRulesErrors({
        field: fieldStatus,
      });
    } else {
      return fieldStatus.$externalErrors ?? [];
    }
  }
  return [];
}

function extractCollectionError(field: $InternalRegleCollectionStatus): $InternalRegleErrors[] {
  return field.$each.map(processFieldErrors);
}

export function extractNestedErrors(
  fields: Record<string, $InternalRegleStatusType> | $InternalRegleStatusType[]
): Record<string, $InternalRegleErrors> {
  return Object.fromEntries(
    Object.entries(fields).map(([fieldKey, fieldStatus]) => {
      if (isNestedRulesStatus(fieldStatus)) {
        return [fieldKey, extractNestedErrors(fieldStatus.$fields)];
      } else if (isCollectionRulesStatus(fieldStatus)) {
        return [
          fieldKey,
          {
            ...(fieldStatus.$field.$rules && {
              $errors: extractRulesErrors({ field: fieldStatus.$field }),
            }),
            $each: extractCollectionError(fieldStatus),
          },
        ];
      } else if (isFieldStatus(fieldStatus)) {
        if (fieldStatus.$error) {
          return [
            fieldKey,
            extractRulesErrors({
              field: fieldStatus,
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
