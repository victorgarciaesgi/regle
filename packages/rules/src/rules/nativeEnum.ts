import type { RegleRuleDefinition, MaybeInput } from '@regle/core';
import { computed, toValue } from 'vue';
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
 * Validate against a native TypeScript enum value. Similar to Zod's `nativeEnum`.
 *
 * @param enumLike - The TypeScript enum to validate against
 *
 * @example
 * ```ts
 * import { nativeEnum } from '@regle/rules';
 *
 * enum Foo {
 *   Bar, Baz
 * }
 *
 * const { r$ } = useRegle({ type: '' }, {
 *   type: { nativeEnum: nativeEnum(Foo) },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#nativeenum Documentation}
 */
export function nativeEnum<T extends EnumLike>(
  enumLike: T
): RegleRuleDefinition<
  'nativeEnum',
  MaybeInput<T[keyof T]>,
  [enumLike: T],
  false,
  boolean,
  MaybeInput<T[keyof T]>,
  string | number
> {
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
    ({ $params: [enumLike] }) => `The value must be one of the following: ${Object.values(enumLike).join(', ')}`
  );

  return rule as any;
}
