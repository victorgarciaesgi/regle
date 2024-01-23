import {
  createRule,
  InlineRuleDeclaration,
  InternalRuleType,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  RegleRuleDefinitionWithMetadataProcessor,
  RegleRuleMetadataConsumer,
  RegleRuleMetadataDefinition,
  RegleRuleRaw,
  RegleRuleWithParamsDefinition,
} from '@regle/core';

export function withMessage<
  TValue extends any,
  TParams extends any[],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  rule: InlineRuleDeclaration<TValue, TReturn, TMetadata, TAsync>,
  newMessage: RegleRuleDefinitionWithMetadataProcessor<
    TValue,
    RegleRuleMetadataConsumer<TParams, TMetadata>,
    string | string[]
  >
): RegleRuleDefinition<TValue, [], TAsync, TMetadata>;
export function withMessage<
  TValue extends any,
  TParams extends any[],
  TMetadata extends RegleRuleMetadataDefinition,
  TReturn extends TMetadata | Promise<TMetadata>,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  rule: RegleRuleWithParamsDefinition<TValue, TParams, TAsync>,
  newMessage: RegleRuleDefinitionWithMetadataProcessor<
    TValue,
    RegleRuleMetadataConsumer<TParams, TMetadata>,
    string | string[]
  >
): RegleRuleWithParamsDefinition<TValue, TParams, TAsync>;
export function withMessage<
  TValue extends any,
  TParams extends any[],
  TMetadata extends RegleRuleMetadataDefinition,
  TReturn extends TMetadata | Promise<TMetadata>,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  rule: RegleRuleDefinition<TValue, TParams, TAsync, TMetadata>,
  newMessage: RegleRuleDefinitionWithMetadataProcessor<
    TValue,
    RegleRuleMetadataConsumer<TParams, TMetadata>,
    string | string[]
  >
): RegleRuleDefinition<TValue, TParams, TAsync>;
export function withMessage<
  TValue extends any,
  TParams extends any[],
  TMetadata extends RegleRuleMetadataDefinition,
  TReturn extends TMetadata | Promise<TMetadata>,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  rule:
    | RegleRuleRaw<TValue, TParams, TAsync, TMetadata>
    | InlineRuleDeclaration<TValue, TReturn, TMetadata, TAsync>,
  newMessage: RegleRuleDefinitionWithMetadataProcessor<
    TValue,
    RegleRuleMetadataConsumer<[TParams], TMetadata>,
    string | string[]
  >
):
  | RegleRuleWithParamsDefinition<TValue, TParams, TAsync, TMetadata>
  | RegleRuleDefinition<TValue, TParams, TAsync, TMetadata> {
  let _type: string | undefined;
  let validator: RegleRuleDefinitionProcessor<TValue, TParams, TMetadata | Promise<TMetadata>>;
  let _active:
    | boolean
    | RegleRuleDefinitionWithMetadataProcessor<
        TValue,
        RegleRuleMetadataConsumer<TParams, TMetadata>,
        boolean
      >
    | undefined;
  let _params: any[] | undefined;

  if (typeof rule === 'function' && !('_validator' in rule)) {
    _type = InternalRuleType.Inline;
    validator = rule;
  } else {
    ({ _type, validator, _active, _params } = rule);
  }

  const newRule = createRule({
    type: _type as any,
    validator: validator as any,
    active: _active as any,
    message: newMessage,
  });

  newRule._params = _params as any;
  newRule._patched = true;

  return newRule as any;
}
