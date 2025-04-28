import type {
  InlineRuleDeclaration,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  RegleRuleDefinitionWithMetadataProcessor,
  RegleRuleMetadataConsumer,
  RegleRuleMetadataDefinition,
  RegleRuleRaw,
  RegleRuleWithParamsDefinition,
  InferRegleRule,
  NoInferLegacy,
} from '@regle/core';
import { createRule, InternalRuleType } from '@regle/core';

/**
 * The withMessage wrapper lets you associate an error message with a rule. Pass your rule as the first argument and the error message as the second.
 * 
 * ```ts
 * const { r$ } = useRegle({ name: '' }, {
    name: {
      customRule1: withMessage((value) => !!value, "Custom Error"),
      customRule2: withMessage(customRuleInlineWithMetaData, "Custom Error"),
      customRule3: withMessage(
        customRuleInlineWithMetaData, 
        ({ $value, foo }) => `Custom Error: ${$value} ${foo}`
      ), 
    }
  })
 * ```
 * Docs: {@link https://reglejs.dev/core-concepts/rules/rule-wrappers#withmessage}
 */

export function withMessage<
  TValue extends any,
  TParams extends any[],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  rule: RegleRuleWithParamsDefinition<TValue, TParams, TAsync, TMetadata>,
  newMessage: RegleRuleDefinitionWithMetadataProcessor<
    TValue,
    RegleRuleMetadataConsumer<TValue, TParams, TMetadata>,
    string | string[]
  >
): RegleRuleWithParamsDefinition<TValue, TParams, TAsync, TMetadata>;
export function withMessage<
  TValue extends any,
  TParams extends unknown[],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  rule: RegleRuleDefinition<TValue, TParams, TAsync, TMetadata>,
  newMessage: RegleRuleDefinitionWithMetadataProcessor<
    TValue,
    RegleRuleMetadataConsumer<TValue, TParams, TMetadata>,
    string | string[]
  >
): RegleRuleDefinition<TValue, TParams, TAsync, TMetadata>;
export function withMessage<
  TValue extends any,
  TParams extends any[],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  rule: InlineRuleDeclaration<TValue, TParams, TReturn>,
  newMessage: RegleRuleDefinitionWithMetadataProcessor<
    TValue,
    RegleRuleMetadataConsumer<TValue, TParams, TReturn extends Promise<infer M> ? M : TReturn>,
    string | string[]
  >
): RegleRuleDefinition<TValue, TParams, TAsync, TReturn extends Promise<infer M> ? M : TReturn>;
export function withMessage(
  rule: RegleRuleRaw<any, any, any, any> | InlineRuleDeclaration<any, any, any>,
  newMessage: RegleRuleDefinitionWithMetadataProcessor<any, RegleRuleMetadataConsumer<any, any[]>, string | string[]>
): RegleRuleWithParamsDefinition<any, any, any, any> | RegleRuleDefinition<any, any, any, any> {
  let _type: string | undefined;
  let validator: RegleRuleDefinitionProcessor<any | Promise<any>>;
  let _active:
    | boolean
    | RegleRuleDefinitionWithMetadataProcessor<any, RegleRuleMetadataConsumer<any, any[]>, boolean>
    | undefined;
  let _params: any[] | undefined;

  if (typeof rule === 'function' && !('_validator' in rule)) {
    _type = InternalRuleType.Inline;
    validator = rule;
  } else {
    ({ _type, validator, _active, _params } = rule);
  }

  const newRule = createRule({
    type: _type,
    validator: validator,
    active: _active,
    message: newMessage,
  }) as RegleRuleRaw;

  const newParams = [...(_params ?? [])] as [];

  newRule._params = newParams as any;
  newRule._message_patched = true;

  if (typeof newRule === 'function') {
    if (_params != null) {
      const executedRule = newRule(...newParams);
      executedRule._message_patched = true;
      return executedRule;
    }
    return newRule as RegleRuleWithParamsDefinition;
  } else {
    return newRule as RegleRuleDefinition;
  }
}
