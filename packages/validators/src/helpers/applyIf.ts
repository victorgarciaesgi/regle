import {
  createRule,
  InlineRuleDeclaration,
  InternalRuleType,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  ParamDecl,
  unwrapRuleParameters,
} from '@regle/core';

export function applyIf<TValue extends any, TRule extends InlineRuleDeclaration<TValue>>(
  _condition: ParamDecl<boolean>,
  rule: TRule
): RegleRuleDefinition<TValue, [], ReturnType<TRule> extends Promise<any> ? true : false>;
export function applyIf<TValue extends any, TParams extends any[], TAsync extends boolean = false>(
  _condition: ParamDecl<boolean>,
  rule: RegleRuleDefinition<TValue, TParams, TAsync>
): RegleRuleDefinition<TValue, TParams, TAsync>;
export function applyIf<TValue extends any, TParams extends any[], TAsync extends boolean = false>(
  _condition: ParamDecl<boolean>,
  rule: RegleRuleDefinition<TValue, TParams, TAsync> | InlineRuleDeclaration<TValue>
): RegleRuleDefinition<TValue, TParams, TAsync> {
  let _type: string | undefined;
  let validator: RegleRuleDefinitionProcessor<TValue, TParams, boolean | Promise<boolean>>;
  let _params: any[] | undefined;
  let _message: string | ((value: TValue | null | undefined, ...args: TParams) => string) = '';

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

  function newActive(value: any, ...args: TParams) {
    const [condition] = unwrapRuleParameters<[boolean]>([_condition]);
    return condition;
  }

  const newRule = createRule<TValue, TParams, TAsync>({
    type: _type,
    validator: newValidator as any,
    active: newActive,
    message: _message,
  }) as RegleRuleDefinition<TValue, TParams, TAsync>;

  newRule._params = _params as any;

  return newRule;
}
