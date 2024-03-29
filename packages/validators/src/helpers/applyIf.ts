import type {
  InlineRuleDeclaration,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  ParamDecl,
  RegleRuleMetadataDefinition,
  RegleRuleMetadataConsumer,
  RegleRuleDefinitionWithMetadataProcessor,
} from '@regle/core';
import { createRule, InternalRuleType, unwrapRuleParameters } from '@regle/core';

export function applyIf<
  TValue extends any,
  TParams extends any[],
  TReturn extends
    | RegleRuleMetadataDefinition
    | Promise<RegleRuleMetadataDefinition> = RegleRuleMetadataDefinition,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  _condition: ParamDecl<boolean>,
  rule:
    | InlineRuleDeclaration<TValue, TReturn>
    | RegleRuleDefinition<TValue, TParams, TAsync, TMetadata>
): RegleRuleDefinition<TValue, [], TAsync, TMetadata> {
  let _type: string | undefined;
  let validator: RegleRuleDefinitionProcessor<any, any, any>;
  let _params: any[] | undefined;
  let _message: RegleRuleDefinitionWithMetadataProcessor<
    any,
    RegleRuleMetadataConsumer<any, any>,
    string | string[]
  > = '';

  if (typeof rule === 'function') {
    _type = InternalRuleType.Inline;
    validator = rule;
  } else {
    ({ _type, validator, _params, _message } = rule);
    _params?.push(_condition);
  }

  function newValidator(value: any, ...args: any[]) {
    const [condition] = unwrapRuleParameters<[boolean]>([_condition]);
    if (condition) {
      return validator(value, ...args);
    }
    return true;
  }

  function newActive(value: any, metadata: RegleRuleMetadataConsumer<any[], any>) {
    const [condition] = unwrapRuleParameters<[boolean]>([_condition]);
    return condition;
  }

  const newRule = createRule({
    type: _type as any,
    validator: newValidator as any,
    active: newActive,
    message: _message,
  });

  newRule._params = _params as any;

  return newRule as any;
}
