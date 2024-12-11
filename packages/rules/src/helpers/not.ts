import type {
  InlineRuleDeclaration,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  RegleRuleDefinitionWithMetadataProcessor,
  RegleRuleMetadataConsumer,
  RegleRuleMetadataDefinition,
} from '@regle/core';
import { createRule } from '@regle/core';
import { ruleHelpers } from './ruleHelpers';

export function not<
  TValue,
  TParams extends any[] = [],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition> = RegleRuleMetadataDefinition,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  rule: RegleRuleDefinition<TValue, TParams, TAsync, TMetadata> | InlineRuleDeclaration<TValue, TParams, TReturn>,
  message?: RegleRuleDefinitionWithMetadataProcessor<
    TValue,
    RegleRuleMetadataConsumer<TValue, TParams, TMetadata>,
    string | string[]
  >
): RegleRuleDefinition<TValue, TParams, TAsync, TMetadata> {
  let _type: string | undefined;
  let validator: RegleRuleDefinitionProcessor<any, any, any>;
  let newValidator: RegleRuleDefinitionProcessor<any, any, any>;
  let _params: any[] | undefined;

  let _async: boolean;

  if (typeof rule === 'function') {
    validator = rule;
    _async = rule.constructor.name === 'AsyncFunction';
  } else {
    ({ _type, validator, _params } = rule);
    _async = rule._async;
  }

  if (_async) {
    newValidator = async (value: any, ...params: any[]) => {
      if (ruleHelpers.isFilled(value)) {
        const result = await validator(value, ...(params as any));
        return !result;
      }
      return true;
    };
  } else {
    newValidator = (value: any, ...params: any[]) => {
      if (ruleHelpers.isFilled(value)) {
        return !validator(value, ...(params as any));
      }
      return true;
    };
  }

  const newRule = createRule({
    type: 'not',
    validator: newValidator,
    message: (message as any) ?? 'Error',
  });

  newRule._params = _params as any;

  return newRule as any;
}
