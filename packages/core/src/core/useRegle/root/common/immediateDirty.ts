import { isEmpty, isObject } from '../../../../../../shared';
import type { RegleImmediateDirtyMode } from '../../../../types';
import { isStatic } from '../../guards';

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

export function shouldApplyImmediateDirty(
  mode: ResolvedImmediateDirtyMode,
  value: unknown,
  rootValue: unknown
): boolean {
  if (mode === 'eager') return true;
  if (mode === 'non-empty') return hasNonEmptyInitialValue(rootValue);
  if (mode === 'lazy-non-empty') return hasNonEmptyInitialValue(value);
  return false;
}

export function shouldApplyFieldImmediateDirty(
  mode: ResolvedImmediateDirtyMode,
  value: unknown,
  rootValue: unknown,
  isRootField = false
): boolean {
  if (mode === 'eager') return true;
  if (mode === 'non-empty') return isRootField && !isEmpty(rootValue);
  if (mode === 'lazy-non-empty') return !isEmpty(value);
  return false;
}
