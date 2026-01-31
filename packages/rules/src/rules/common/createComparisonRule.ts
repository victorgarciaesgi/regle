import type { CommonComparisonOptions, MaybeInput, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from '../../helpers/ruleHelpers/isFilled';
import { toNumber } from '../../helpers/ruleHelpers/toNumber';

export type ComparisonDirection = 'min' | 'max';

interface CreateValueComparisonRuleOptions<TType extends string | unknown> {
  type: TType;
  direction: ComparisonDirection;
}

/**
 * Factory function to create value comparison rules (minValue/maxValue).
 * Reduces duplication between similar comparison rules.
 */
export function createValueComparisonRule<TType extends string | unknown>({
  type,
  direction,
}: CreateValueComparisonRuleOptions<TType>): RegleRuleWithParamsDefinition<
  TType,
  number | string,
  [limit: number | string, options?: CommonComparisonOptions],
  false,
  boolean,
  MaybeInput<number | string>
> {
  const compare = (value: number, limit: number, allowEqual: boolean): boolean => {
    if (direction === 'min') {
      return allowEqual ? value >= limit : value > limit;
    }
    return allowEqual ? value <= limit : value < limit;
  };

  const getMessage = (limit: number | string, allowEqual: boolean): string => {
    if (direction === 'min') {
      return allowEqual
        ? `The value must be greater than or equal to ${limit}`
        : `The value must be greater than ${limit}`;
    }
    return allowEqual ? `The value must be less than or equal to ${limit}` : `The value must be less than ${limit}`;
  };

  return createRule({
    type,
    validator: (value: MaybeInput<number | string>, limit: number | string, options?: CommonComparisonOptions) => {
      const { allowEqual = true } = options ?? {};
      if (isFilled(value) && isFilled(limit)) {
        if (!isNaN(toNumber(value)) && !isNaN(toNumber(limit))) {
          return compare(toNumber(value), toNumber(limit), allowEqual);
        }
        if (__IS_DEV__) {
          console.warn(`[${type}] Value or parameter isn't a number, got value: ${value}, parameter: ${limit}`);
        }
        return true;
      }
      return true;
    },
    message: ({ $params: [limit, options] }) => {
      const { allowEqual = true } = options ?? {};
      return getMessage(limit, allowEqual);
    },
  });
}
