import {
  createRule,
  InlineRuleDeclaration,
  InternalRuleType,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  RegleRuleRaw,
  RegleRuleWithParamsDefinition,
} from '@regle/core';

export function withMessage<TValue extends any>(
  rule: InlineRuleDeclaration<TValue>,
  newMessage: string | ((value: TValue) => string)
): RegleRuleDefinition<TValue>;
export function withMessage<TValue extends any, TParams extends any[]>(
  rule: RegleRuleWithParamsDefinition<TValue, TParams>,
  newMessage: string | ((value: TValue, ...args: TParams) => string)
): RegleRuleWithParamsDefinition<TValue, TParams>;
export function withMessage<TValue extends any, TParams extends any[]>(
  rule: RegleRuleDefinition<TValue, TParams>,
  newMessage: string | ((value: TValue, ...args: TParams) => string)
): RegleRuleDefinition<TValue, TParams>;
export function withMessage<TValue extends any, TParams extends any[]>(
  rule: RegleRuleRaw<TValue, TParams> | InlineRuleDeclaration<TValue>,
  newMessage: string | ((value: any, ...args: any[]) => string)
): RegleRuleWithParamsDefinition<TValue, TParams> | RegleRuleDefinition<TValue, TParams> {
  let _type: string;
  let validator: RegleRuleDefinitionProcessor<TValue, TParams, boolean | Promise<boolean>>;
  let _active: boolean | RegleRuleDefinitionProcessor<TValue, TParams, boolean> | undefined;
  let _params: any[] | undefined;

  if (typeof rule === 'function' && !('_validator' in rule)) {
    _type = InternalRuleType.Inline;
    validator = rule;
  } else {
    ({ _type, validator, _active, _params } = rule);
  }

  const newRule = createRule<TValue, TParams>({
    type: _type,
    validator: validator,
    active: _active,
    message: newMessage,
  });

  newRule._params = _params as any;
  newRule._patched = true;

  return newRule;
}
