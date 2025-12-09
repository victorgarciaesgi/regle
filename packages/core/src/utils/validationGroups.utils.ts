import type { RegleValidationGroupEntry } from '../types';

export function mergeBooleanGroupProperties(
  entries: RegleValidationGroupEntry[],
  property?: Extract<
    keyof NonNullable<RegleValidationGroupEntry>,
    '$invalid' | '$error' | '$pending' | '$dirty' | '$correct'
  >
) {
  return entries.some((entry) => {
    if (!property) return false;
    return entry?.[property];
  });
}
export function mergeArrayGroupProperties(
  entries: RegleValidationGroupEntry[],
  property?: Extract<keyof NonNullable<RegleValidationGroupEntry>, '$errors' | '$silentErrors'>
) {
  if (!property) return [];
  return entries.reduce((all, entry) => {
    const fetchedProperty = entry?.[property] || [];
    return all.concat(fetchedProperty);
  }, [] as string[]);
}
