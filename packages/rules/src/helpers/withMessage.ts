import type {
  InlineRuleDeclaration,
  RegleRuleDefinition,
  RegleRuleDefinitionWithMetadataProcessor,
  RegleRuleMetadataConsumer,
  RegleRuleMetadataDefinition,
  RegleRuleRaw,
  RegleRuleWithParamsDefinition,
} from '@regle/core';
import { createRule } from '@regle/core';
import { extractValidator } from './common/extractValidator';

/**
 * The `withMessage` wrapper lets you associate an error message with a rule.
 * Pass your rule as the first argument and the error message as the second.
 *
 * @param rule - The rule to wrap (can be inline function or rule definition)
 * @param newMessage - The error message (string or function returning a string)
 *
 * @example
 * ```ts
 * import { withMessage } from '@regle/rules';
 *
 * const { r$ } = useRegle({ name: '' }, {
 *   name: {
 *     // With a static message
 *     customRule1: withMessage((value) => !!value, "Custom Error"),
 *     // With dynamic message using metadata
 *     customRule2: withMessage(
 *       customRuleInlineWithMetaData,
 *       ({ $value, foo }) => `Custom Error: ${$value} ${foo}`
 *     ),
 *   }
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/rule-wrappers#withmessage Documentation}
 */

export function withMessage<
  TType extends string | unknown,
  TValue extends any,
  TParams extends any[],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
  TInput extends unknown = unknown,
  TFilteredValue = any,
  TNonEmpty extends boolean = false,
>(
  rule: RegleRuleWithParamsDefinition<TType, TValue, TParams, TAsync, TMetadata, TInput, TFilteredValue, TNonEmpty>,
  newMessage: RegleRuleDefinitionWithMetadataProcessor<
    TValue,
    RegleRuleMetadataConsumer<TValue, TParams, TMetadata>,
    string | string[]
  >
): RegleRuleWithParamsDefinition<TType, TValue, TParams, TAsync, TMetadata, TInput, TFilteredValue, TNonEmpty>;
export function withMessage<
  TType extends string | unknown,
  TValue extends any,
  TParams extends unknown[],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
  TInput extends unknown = unknown,
  TFilteredValue = any,
  TNonEmpty extends boolean = false,
>(
  rule: RegleRuleDefinition<TType, TValue, TParams, TAsync, TMetadata, TInput, TFilteredValue, TNonEmpty>,
  newMessage: RegleRuleDefinitionWithMetadataProcessor<
    TValue,
    RegleRuleMetadataConsumer<TValue, TParams, TMetadata>,
    string | string[]
  >
): RegleRuleDefinition<TType, TValue, TParams, TAsync, TMetadata, TInput, TFilteredValue, TNonEmpty>;
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
): RegleRuleDefinition<unknown, TValue, TParams, TAsync, TReturn extends Promise<infer M> ? M : TReturn>;
export function withMessage<
  TType extends string | unknown,
  TValue extends any,
  TParams extends any[],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
  TInput extends unknown = unknown,
  TFilteredValue = any,
  TNonEmpty extends boolean = false,
>(
  rule: (
    ...args: any[]
  ) => RegleRuleDefinition<TType, TValue, TParams, TAsync, TMetadata, TInput, TFilteredValue, TNonEmpty>,
  newMessage: RegleRuleDefinitionWithMetadataProcessor<
    TValue,
    RegleRuleMetadataConsumer<TValue, TParams, TMetadata>,
    string | string[]
  >
): RegleRuleWithParamsDefinition<TType, TValue, TParams, TAsync, TMetadata, TInput, TFilteredValue, TNonEmpty>;
export function withMessage(
  rule: RegleRuleRaw<any, any, any, any> | InlineRuleDeclaration<any, any, any>,
  newMessage: RegleRuleDefinitionWithMetadataProcessor<any, RegleRuleMetadataConsumer<any, any[]>, string | string[]>
): RegleRuleWithParamsDefinition<any, any, any, any> | RegleRuleDefinition<any, any, any, any> {
  const { _type, validator, _active, _params, _async } = extractValidator(rule);

  const newRule = createRule({
    type: _type,
    validator: validator,
    active: _active,
    message: newMessage,
    async: _async,
  }) as RegleRuleRaw;

  const newParams = _params ?? [];

  newRule._params = newParams;
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
