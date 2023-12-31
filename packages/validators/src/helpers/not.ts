import {
  FormRuleDeclaration,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  createRule,
} from '@regle/core';
import { ruleHelpers } from './ruleHelpers';

export function not<TValue, TParams extends any[] = any[], TAsync extends boolean = false>(
  rule: RegleRuleDefinition<TValue, TParams, TAsync>,
  message: string | RegleRuleDefinitionProcessor<TValue, TParams, string>
): RegleRuleDefinition<TValue, [], TAsync> {
  let _type: string | undefined;
  let _params: any[] | undefined = [];
  let _async = false;

  ({ _type, _params, _async } = rule);
  if (_type) {
    _type = `!${_type}`;
  }

  const validator = (() => {
    if (_async) {
      return async (value: any, ...params: any[]) => {
        if (ruleHelpers.isFilled(value)) {
          const result = await rule.validator(value, ...(params as any));
          return !result;
        }
        return true;
      };
    } else {
      return (value: any, ...params: any[]) => {
        if (ruleHelpers.isFilled(value)) {
          return !rule.validator(value, ...(params as any));
        }
        return true;
      };
    }
  })();

  const newRule = createRule({
    validator: validator as any,
    message,
  });

  newRule._params = _params as any;

  return newRule as RegleRuleDefinition<TValue, [], TAsync>;
}
