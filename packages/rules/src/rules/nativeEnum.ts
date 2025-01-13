import type { Maybe, RegleRuleDefinition } from '@regle/core';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { isEmpty, isFilled, withMessage, withParams } from '../helpers';

export type EnumLike = {
  [k: string]: string | number;
  [nu: number]: string;
};

function getValidEnumValues(obj: any) {
  const validKeys = Object.keys(obj).filter((k: any) => typeof obj[obj[k]] !== 'number');
  const filtered: any = {};
  for (const k of validKeys) {
    filtered[k] = obj[k];
  }
  return Object.values(filtered);
}

/**
 * Validate against a native Typescript enum value.
 */
export function nativeEnum<T extends EnumLike>(
  enumLike: T
): RegleRuleDefinition<T[keyof T], [enumLike: T], false, boolean, string | number> {
  const params = computed<EnumLike>(() => toValue(enumLike));

  const rule = withMessage(
    withParams(
      (value: unknown, enumLike) => {
        if (isFilled(value) && !isEmpty(enumLike)) {
          const validValues = getValidEnumValues(enumLike);
          return validValues.includes(value);
        }

        return true;
      },
      [params]
    ),
    ({ $params: [enumLike] }) => `Value should be one of those options: ${Object.values(enumLike).join(', ')}.`
  );

  return rule as any;
}
