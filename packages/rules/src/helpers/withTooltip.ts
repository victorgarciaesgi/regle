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
} from '@regle/core';
import { createRule, InternalRuleType } from '@regle/core';

/**
 * The withTooltip wrapper allows you to display additional messages for your field that aren’t necessarily errors. Tooltips are aggregated and accessible via $fields.xxx.$tooltips .
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
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  rule: InlineRuleDeclaration<TValue, TParams, TReturn>,
  newTooltip: RegleRuleDefinitionWithMetadataProcessor<
    TValue,
    RegleRuleMetadataConsumer<TValue, TParams, TMetadata>,
    string | string[]
  >
): RegleRuleDefinition<TValue, TParams, TAsync, TMetadata>;
export function withTooltip(
  rule: RegleRuleRaw<any, any, any, any> | InlineRuleDeclaration<any, any>,
  newTooltip: RegleRuleDefinitionWithMetadataProcessor<any, RegleRuleMetadataConsumer<any, any[]>, string | string[]>
): RegleRuleWithParamsDefinition<any, any, any, any> | RegleRuleDefinition<any, any, any, any> {
  let _type: string | undefined;
  let validator: RegleRuleDefinitionProcessor<any | Promise<any>>;
  let _active:
    | boolean
    | RegleRuleDefinitionWithMetadataProcessor<any, RegleRuleMetadataConsumer<any, any[]>, boolean>
    | undefined;
  let _params: any[] | undefined;
  let _message: any;

  if (typeof rule === 'function' && !('_validator' in rule)) {
    _type = InternalRuleType.Inline;
    validator = rule;
  } else {
    ({ _type, validator, _active, _params, _message } = rule);
  }

  const newRule = createRule({
    type: _type,
    validator: validator,
    active: _active,
    message: _message,
    tooltip: newTooltip,
  }) as RegleRuleRaw;

  const newParams = [...(_params ?? [])] as [];

  newRule._params = newParams as any;
  newRule._tooltip_patched = true;

  if (typeof newRule === 'function') {
    const executedRule = newRule(...newParams);
    newRule._tooltip_patched = true;
    return executedRule;
  } else {
    return newRule;
  }
}
