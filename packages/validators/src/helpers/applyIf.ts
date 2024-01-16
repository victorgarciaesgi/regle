import {
  createRule,
  InlineRuleDeclaration,
  InternalRuleType,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  ParamDecl,
  unwrapRuleParameters,
  RegleRuleMetadataDefinition,
  RegleRuleMetadataConsumer,
} from '@regle/core';

export function applyIf<
  TValue extends any,
  TMetaData extends RegleRuleMetadataDefinition,
  TRule extends InlineRuleDeclaration<TValue, TMetaData>,
>(
  _condition: ParamDecl<boolean>,
  rule: TRule
): RegleRuleDefinition<TValue, [], ReturnType<TRule> extends Promise<any> ? true : false>;
export function applyIf<
  TValue extends any,
  TParams extends any[],
  TAsync extends boolean = false,
  TMetadata extends RegleRuleMetadataDefinition = boolean,
>(
  _condition: ParamDecl<boolean>,
  rule: RegleRuleDefinition<TValue, TParams, TAsync>
): RegleRuleDefinition<TValue, TParams, TAsync>;
export function applyIf<
  TValue extends any,
  TParams extends any[],
  TAsync extends boolean = false,
  TMetadata extends RegleRuleMetadataDefinition = boolean,
>(
  _condition: ParamDecl<boolean>,
  rule:
    | RegleRuleDefinition<TValue, TParams, TAsync, TMetadata>
    | InlineRuleDeclaration<TValue, TMetadata>
): RegleRuleDefinition<TValue, TParams, TAsync, TMetadata> {
  let _type: string | undefined;
  let validator: RegleRuleDefinitionProcessor<TValue, TParams, TMetadata | Promise<TMetadata>>;
  let _params: any[] | undefined;
  let _message:
    | string
    | ((
        value: TValue | null | undefined,
        metadata: RegleRuleMetadataConsumer<TParams, TMetadata>
      ) => string) = '';

  if (typeof rule === 'function') {
    _type = InternalRuleType.Inline;
    validator = rule;
  } else {
    ({ _type, validator, _params, _message } = rule);
    _params?.push(_condition);
  }

  function newValidator(value: any, ...args: TParams) {
    const [condition] = unwrapRuleParameters<[boolean]>([_condition]);
    if (condition) {
      return validator(value, ...args);
    }
    return true;
  }

  function newActive(value: any, metadata: RegleRuleMetadataConsumer<TParams, TMetadata>) {
    const [condition] = unwrapRuleParameters<[boolean]>([_condition]);
    return condition;
  }

  const newRule = createRule<TValue, TParams, TAsync, TMetadata>({
    type: _type,
    validator: newValidator as any,
    active: newActive,
    message: _message,
  }) as RegleRuleDefinition<TValue, TParams, TAsync, TMetadata>;

  newRule._params = _params as any;

  return newRule;
}
