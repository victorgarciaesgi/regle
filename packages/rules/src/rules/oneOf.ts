import type { Maybe, RegleRuleDefinition } from '@regle/core';
import { computed, toValue, type MaybeRefOrGetter } from 'vue';
import { isFilled, withMessage, withParams } from '../helpers';

/**
 * Allow only one of the values from a fixed Array of possible entries.
 */
export function oneOf<const TValues extends [string | number, ...(string | number)[]]>(
  options: MaybeRefOrGetter<[...TValues]>
): RegleRuleDefinition<TValues[number], [options: TValues], false, boolean, string | number, string | number> {
  const params = computed<[string | number, ...(string | number)[]]>(() => toValue(options));

  const rule = withMessage(
    withParams(
      (value: Maybe<string | number>, options) => {
        if (isFilled(value) && isFilled(options, false)) {
          return options.includes(value);
        }

        return true;
      },
      [params]
    ),
    ({ $params: [options] }) => `The value should be one of those options: ${options.join(', ')}.`
  );

  return rule as any;
}
