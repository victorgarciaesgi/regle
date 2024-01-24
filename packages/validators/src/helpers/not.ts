import {
  RegleRuleDefinition,
  RegleRuleDefinitionWithMetadataProcessor,
  RegleRuleMetadataConsumer,
  RegleRuleMetadataDefinition,
  createRule,
  defineType,
} from '@regle/core';
import { ruleHelpers } from './ruleHelpers';

export function not<
  TValue,
  TParams extends any[] = any[],
  TAsync extends boolean = boolean,
  TMetadata extends RegleRuleMetadataDefinition = boolean,
>(
  rule: RegleRuleDefinition<TValue, TParams, TAsync, TMetadata>,
  message: RegleRuleDefinitionWithMetadataProcessor<
    TValue,
    RegleRuleMetadataConsumer<TParams, TMetadata>,
    string | string[]
  >
): RegleRuleDefinition<TValue, TParams, TAsync, TMetadata> {
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
    type: defineType('not') as any,
    validator: validator as any,
    message,
  });

  newRule._params = _params as any;

  return newRule as RegleRuleDefinition<TValue, TParams, TAsync, TMetadata>;
}
