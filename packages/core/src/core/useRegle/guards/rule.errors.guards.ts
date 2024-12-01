import type { $InternalRegleErrors, RegleCollectionErrors } from '../../../types';

export function isExternalErrorCollection(
  value: $InternalRegleErrors
): value is RegleCollectionErrors<any> {
  return '$each' in value || '$errors' in value;
}
