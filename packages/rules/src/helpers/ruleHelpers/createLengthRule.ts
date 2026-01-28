import type { CommonComparisonOptions, Maybe, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from './isFilled';
import { isNumber } from './isNumber';
import { getSize } from './getSize';

export type LengthDirection = 'min' | 'max';

interface CreateLengthRuleOptions {
  type: string;
  direction: LengthDirection;
}

/**
 * Factory function to create length comparison rules (minLength/maxLength).
 * Reduces duplication between similar length rules.
 */
export function createLengthRule({
  type,
  direction,
}: CreateLengthRuleOptions): RegleRuleWithParamsDefinition<
  string | any[] | Record<PropertyKey, any>,
  [limit: number, options?: CommonComparisonOptions],
  false,
  boolean
> {
  const compare = (size: number, limit: number, allowEqual: boolean): boolean => {
    if (direction === 'min') {
      return allowEqual ? size >= limit : size > limit;
    }
    return allowEqual ? size <= limit : size < limit;
  };

  const getMessage = (value: unknown, limit: number): string => {
    if (Array.isArray(value)) {
      return direction === 'min'
        ? `The list must have at least ${limit} items`
        : `The list must have at most ${limit} items`;
    }
    return direction === 'min'
      ? `The value must be at least ${limit} characters long`
      : `The value must be at most ${limit} characters long`;
  };

  return createRule({
    type,
    validator: (
      value: Maybe<string | Record<PropertyKey, any> | any[]>,
      limit: number,
      options?: CommonComparisonOptions
    ) => {
      const { allowEqual = true } = options ?? {};
      if (isFilled(value, false) && isFilled(limit)) {
        if (isNumber(limit)) {
          return compare(getSize(value), limit, allowEqual);
        }
        if (__IS_DEV__) {
          console.warn(`[${type}] Parameter isn't a number, got parameter: ${limit}`);
        }
        return true;
      }
      return true;
    },
    message: ({ $value, $params: [limit] }) => {
      return getMessage($value, limit);
    },
  });
}
