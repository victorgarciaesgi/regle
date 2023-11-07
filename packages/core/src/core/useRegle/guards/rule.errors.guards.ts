import { $InternalExternalRegleErrors, RegleExternalCollectionErrors } from '../../../types';

export function isExternalErrorCollection(
  value: $InternalExternalRegleErrors
): value is RegleExternalCollectionErrors {
  return '$each' in value || '$errors' in value;
}
