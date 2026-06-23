import { isEmpty, isObject } from '../../../../../../shared';
import type { $InternalRegleStatusType, RegleImmediateDirtyMode } from '../../../../types';
import { isCollectionRulesStatus, isFieldStatus, isNestedRulesStatus, isStatic } from '../../guards';

export type ResolvedImmediateDirtyMode = RegleImmediateDirtyMode | false;

export function resolveImmediateDirtyMode(
  value: boolean | RegleImmediateDirtyMode | undefined
): ResolvedImmediateDirtyMode {
  if (value === true) return 'eager';
  if (value === false || value == null) return false;
  return value;
}

export function hasNonEmptyInitialValue(value: unknown): boolean {
  if (isObject(value) && !isStatic(value)) {
    return Object.values(value).some((item) => hasNonEmptyInitialValue(item));
  }

  if (Array.isArray(value)) {
    return value.some((item) => hasNonEmptyInitialValue(item));
  }

  return !isEmpty(value);
}

/**
 * Walks a validation status and its initial value, returning `true` as soon as an
 * active (rule-bearing) field holds a non-empty initial value. Inactive fields and
 * their values are ignored, so a prefilled field without rules won't trigger a touch.
 */
function statusHasActiveNonEmptyValue(status: $InternalRegleStatusType, initialValue: unknown): boolean {
  if (isFieldStatus(status)) {
    return !status.$inactive && hasNonEmptyInitialValue(initialValue);
  }

  if (isNestedRulesStatus(status)) {
    return childrenHaveActiveNonEmptyValue(status.$self, status.$fields, initialValue);
  }

  if (isCollectionRulesStatus(status) && Array.isArray(initialValue)) {
    if (status.$self && statusHasActiveNonEmptyValue(status.$self, initialValue)) {
      return true;
    }
    return status.$each.some((item, index) => statusHasActiveNonEmptyValue(item, initialValue[index]));
  }

  return false;
}

/**
 * Same check as {@link statusHasActiveNonEmptyValue} for a nested node whose `$self`
 * status and `$fields` are held separately (e.g. the root status).
 */
export function childrenHaveActiveNonEmptyValue(
  selfStatus: $InternalRegleStatusType | undefined,
  fields: Record<string, $InternalRegleStatusType>,
  initialValue: unknown
): boolean {
  if (selfStatus && statusHasActiveNonEmptyValue(selfStatus, initialValue)) {
    return true;
  }

  if (!isObject(initialValue) || isStatic(initialValue)) {
    return false;
  }

  const state = initialValue as Record<string, unknown>;
  return Object.entries(fields).some(([key, child]) => statusHasActiveNonEmptyValue(child, state[key]));
}

/**
 * Determines whether a field should be marked as dirty based on its immediate dirty mode and value.
 */
export function shouldApplyFieldImmediateDirty(
  mode: ResolvedImmediateDirtyMode,
  value: unknown,
  rootValue: unknown,
  isRootField = false,
  isInactive = false
): boolean {
  if (mode === 'eager') return true;
  if (mode === 'non-empty') {
    if (!isRootField || isInactive) return false;
    return hasNonEmptyInitialValue(rootValue);
  }
  if (mode === 'lazy-non-empty') return hasNonEmptyInitialValue(value);
  return false;
}
