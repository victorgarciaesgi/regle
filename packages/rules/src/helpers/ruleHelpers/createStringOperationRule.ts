import type { MaybeInput, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from './isFilled';
import { isString } from './isString';

export type StringOperation = 'contains' | 'startsWith' | 'endsWith';

interface CreateStringOperationRuleOptions {
  type: string;
  operation: StringOperation;
}

/**
 * Factory function to create string operation rules (contains/startsWith/endsWith).
 * Reduces duplication between similar string validation rules.
 */
export function createStringOperationRule({
  type,
  operation,
}: CreateStringOperationRuleOptions): RegleRuleWithParamsDefinition<
  string,
  [part: MaybeInput<string>],
  false,
  boolean,
  MaybeInput<string>
> {
  const operationFn = (value: string, part: string): boolean => {
    switch (operation) {
      case 'contains':
        return value.includes(part);
      case 'startsWith':
        return value.startsWith(part);
      case 'endsWith':
        return value.endsWith(part);
    }
  };

  const getMessage = (part: string): string => {
    switch (operation) {
      case 'contains':
        return `The value must contain ${part}`;
      case 'startsWith':
        return `The value must start with ${part}`;
      case 'endsWith':
        return `The value must end with ${part}`;
    }
  };

  return createRule({
    type,
    validator(value: MaybeInput<string>, part: MaybeInput<string>) {
      if (isFilled(value) && isFilled(part) && isString(value) && isString(part)) {
        return operationFn(value, part);
      }
      return true;
    },
    message({ $params: [part] }) {
      return getMessage(part as string);
    },
  });
}
