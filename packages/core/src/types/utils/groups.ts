import type { Ref } from 'vue';
import { computed, toRefs } from 'vue';
import type { RegleValidationGroupEntry } from '../core';

export function mergeBooleanGroupProperties(
  entries: RegleValidationGroupEntry[],
  property: Extract<keyof RegleValidationGroupEntry, '$invalid' | '$error' | '$pending' | '$dirty' | '$valid'>
) {
  return entries.some((entry) => {
    return entry[property];
  });
}
export function mergeArrayGroupProperties(
  entries: RegleValidationGroupEntry[],
  property: Extract<keyof RegleValidationGroupEntry, '$errors' | '$silentErrors'>
) {
  return entries.reduce((all, entry) => {
    const fetchedProperty = entry[property] || [];
    return all.concat(fetchedProperty);
  }, [] as string[]);
}
