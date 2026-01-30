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
 * The `withTooltip` wrapper allows you to display additional messages for your field that aren't necessarily errors.
 * Tooltips are aggregated and accessible via `$tooltips` property.
 *
 * @param rule - The rule to wrap (can be inline function or rule definition)
 * @param newTooltip - The tooltip message (string or function returning a string)
 *
 * @example
 * ```ts
 * import { withTooltip, minLength } from '@regle/rules';
 *
 * const { r$ } = useRegle({ password: '' }, {
 *   password: {
 *     minLength: withTooltip(
 *       minLength(8),
 *       'Password should be at least 8 characters for better security'
 *     ),
 *   }
 * })
 *
 * // Access tooltips via:
 * // r$.password.$tooltips
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/rule-wrappers#withtooltip Documentation}
 */

export function withTooltip<
  TValue extends any,
  TParams extends any[],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  rule: RegleRuleWithParamsDefinition<TValue, TParams, TAsync, TMetadata>,
  newTooltip: RegleRuleDefinitionWithMetadataProcessor<
    TValue,
    RegleRuleMetadataConsumer<TValue, TParams, TMetadata>,
    string | string[]
  >
): RegleRuleWithParamsDefinition<TValue, TParams, TAsync, TMetadata>;
export function withTooltip<
  TValue extends any,
  TParams extends any[],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  rule: RegleRuleDefinition<TValue, TParams, TAsync, TMetadata>,
  newTooltip: RegleRuleDefinitionWithMetadataProcessor<
    TValue,
    RegleRuleMetadataConsumer<TValue, TParams, TMetadata>,
    string | string[]
  >
): RegleRuleDefinition<TValue, TParams, TAsync, TMetadata>;
export function withTooltip<
  TValue extends any,
  TParams extends any[],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  rule: InlineRuleDeclaration<TValue, TParams, TReturn>,
  newTooltip: RegleRuleDefinitionWithMetadataProcessor<
    TValue,
    RegleRuleMetadataConsumer<TValue, TParams, TReturn extends Promise<infer M> ? M : TReturn>,
    string | string[]
  >
): RegleRuleDefinition<TValue, TParams, TAsync, TReturn extends Promise<infer M> ? M : TReturn>;
export function withTooltip(
  rule: RegleRuleRaw<any, any, any, any> | InlineRuleDeclaration<any, any>,
  newTooltip: RegleRuleDefinitionWithMetadataProcessor<any, RegleRuleMetadataConsumer<any, any[]>, string | string[]>
): RegleRuleWithParamsDefinition<any, any, any, any> | RegleRuleDefinition<any, any, any, any> {
  const { _type, validator, _active, _params, _message, _async } = extractValidator(rule);

  const newRule = createRule({
    type: _type,
    validator: validator,
    active: _active,
    message: _message,
    tooltip: newTooltip,
    async: _async,
  }) as RegleRuleRaw;

  const newParams = _params ?? [];

  newRule._params = newParams;
  newRule._tooltip_patched = true;

  if (typeof newRule === 'function') {
    const executedRule = newRule(...newParams);
    newRule._tooltip_patched = true;
    return executedRule;
  } else {
    return newRule;
  }
}
