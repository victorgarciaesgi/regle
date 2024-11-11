import type { Ref } from 'vue';
import { computed, toRefs } from 'vue';
import type { RegleValidationGroupEntry } from '../core';

export function mergeBooleanGroupProperties(
  entries: Ref<RegleValidationGroupEntry[]>,
  property: Extract<
    keyof RegleValidationGroupEntry,
    '$invalid' | '$error' | '$pending' | '$dirty' | '$valid'
  >
) {
  return computed(() => {
    return entries.value.some((entry) => {
      return entry[property];
    });
  });
}
export function mergeArrayGroupProperties(
  entries: Ref<RegleValidationGroupEntry[]>,
  property: Extract<keyof RegleValidationGroupEntry, '$errors' | '$silentErrors'>
) {
  return computed(() => {
    return entries.value.reduce((all, entry) => {
      const fetchedProperty = entry[property] || [];
      return all.concat(fetchedProperty);
    }, [] as string[]);
  });
}
