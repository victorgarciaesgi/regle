import {
  FormRuleDeclaration,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  createRule,
} from '@regle/core';
import { ruleHelpers } from './rulesHelpers';

export function not<TValue, TParams extends any[] = any[]>(
  rule: FormRuleDeclaration<TValue, TParams>,
  message: string | RegleRuleDefinitionProcessor<TValue, TParams, string>
): RegleRuleDefinition<TValue> {
  let _type = 'not';
  let _active: boolean | RegleRuleDefinitionProcessor<any, [], boolean> | undefined;
  let _params: any[] | undefined = [];
  let _async = false;

  if (typeof rule === 'function') {
    _async = rule.constructor.name === 'AsyncFunction';
  } else {
    ({ _type, _params, _async } = rule);
  }

  const validator = (() => {
    if (_async) {
      return async (value: any, ...params: any[]) => {
        if (ruleHelpers.isFilled(value)) {
          if (typeof rule === 'function') {
            const result = await rule(value);
            return !result;
          } else {
            const result = await rule._validator(value, ...(params as any));
            return !result;
          }
        }
        return true;
      };
    } else {
      return (value: any, ...params: any[]) => {
        if (ruleHelpers.isFilled(value)) {
          if (typeof rule === 'function') {
            return !rule(value);
          } else {
            return !rule._validator(value, ...(params as any));
          }
        }
        return true;
      };
    }
  })();

  const newRule = createRule({
    type: 'not',
    validator: validator,
    message,
  });

  newRule._params = _params as any;

  return newRule as RegleRuleDefinition;
}
