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
  TMetaData extends RegleRuleMetadataDefinition,
  TRule extends InlineRuleDeclaration<TValue, TMetaData>,
>(
  rule: TRule,
  newMessage: string | string[] | ((value: TValue) => string | string[])
): RegleRuleDefinition<TValue, [], ReturnType<TRule> extends Promise<any> ? true : false>;
export function withMessage<
  TValue extends any,
  TParams extends any[],
  TAsync extends boolean = false,
  TMetadata extends RegleRuleMetadataDefinition = boolean,
>(
  rule: RegleRuleWithParamsDefinition<TValue, TParams, TAsync>,
  newMessage:
    | string
    | string[]
    | ((
        value: TValue,
        metadata: RegleRuleMetadataConsumer<TParams, TMetadata>
      ) => string | string[])
): RegleRuleWithParamsDefinition<TValue, TParams, TAsync>;
export function withMessage<
  TValue extends any,
  TParams extends any[],
  TAsync extends boolean = false,
  TMetadata extends RegleRuleMetadataDefinition = boolean,
>(
  rule: RegleRuleDefinition<TValue, TParams, TAsync, TMetadata>,
  newMessage:
    | string
    | string[]
    | ((
        value: TValue,
        metadata: RegleRuleMetadataConsumer<TParams, TMetadata>
      ) => string | string[])
): RegleRuleDefinition<TValue, TParams, TAsync>;
export function withMessage<
  TValue extends any,
  TParams extends any[],
  TAsync extends boolean = false,
  TMetadata extends RegleRuleMetadataDefinition = boolean,
>(
  rule: RegleRuleRaw<TValue, TParams, TAsync, TMetadata> | InlineRuleDeclaration<TValue, TMetadata>,
  newMessage:
    | string
    | string[]
    | ((value: any, metadata: RegleRuleMetadataConsumer<TParams, TMetadata>) => string | string[])
):
  | RegleRuleWithParamsDefinition<TValue, TParams, TAsync>
  | RegleRuleDefinition<TValue, TParams, TAsync> {
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
    active: _active,
    message: newMessage,
  });

  newRule._params = _params as any;
  newRule._patched = true;

  return newRule as any;
}
