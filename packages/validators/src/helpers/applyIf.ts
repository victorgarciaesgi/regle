import {
  createRule,
  InlineRuleDeclaration,
  InternalRuleType,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  ParamDecl,
  RegleRuleWithParamsDefinition,
  unwrapRuleParameters,
} from '@regle/core';

export function applyIf<TValue extends any>(
  _condition: ParamDecl<boolean>,
  rule: InlineRuleDeclaration<TValue>
): RegleRuleDefinition<TValue>;
export function applyIf<TValue extends any, TParams extends any[]>(
  _condition: ParamDecl<boolean>,
  rule: RegleRuleDefinition<TValue, TParams>
): RegleRuleDefinition<TValue, TParams>;
export function applyIf<TValue extends any, TParams extends any[]>(
  _condition: ParamDecl<boolean>,
  rule: RegleRuleDefinition<TValue, TParams> | InlineRuleDeclaration<TValue>
): RegleRuleWithParamsDefinition<TValue, TParams> | RegleRuleDefinition<TValue, TParams> {
  let _type: string;
  let validator: RegleRuleDefinitionProcessor<TValue, TParams, boolean | Promise<boolean>>;
  let _active: boolean | RegleRuleDefinitionProcessor<TValue, TParams, boolean> | undefined;
  let _params: any[] | undefined;
  let _message: string | ((value: TValue | null | undefined, ...args: TParams) => string) = '';

  if (typeof rule === 'function') {
    _type = InternalRuleType.Inline;
    validator = rule;
  } else {
    ({ _type, validator, _active, _params, _message } = rule);
    _params?.push(_condition);
  }

  function newValidator(value: any, ...args: TParams) {
    const [condition] = unwrapRuleParameters<[boolean]>([_condition]);
    if (condition) {
      return validator(value, ...args);
    }
    return true;
  }

  const newRule = createRule<TValue, TParams>({
    type: _type,
    validator: newValidator,
    active: _active,
    message: _message,
  });

  newRule._params = _params as any;

  return newRule;
}
