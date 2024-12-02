import type { $InternalRegleErrors, RegleCollectionErrors } from '../../../types';

export function isExternalErrorCollection(
  value: $InternalRegleErrors | undefined
): value is RegleCollectionErrors<any> {
  return !!value && ('$each' in value || '$errors' in value);
}
