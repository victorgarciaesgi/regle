import {
  createRule,
  InlineRuleDeclaration,
  InternalRuleType,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  RegleRuleRaw,
  RegleRuleWithParamsDefinition,
} from '@regle/core';

export function withMessage<TValue extends any, TRule extends InlineRuleDeclaration<TValue>>(
  rule: TRule,
  newMessage: string | ((value: TValue) => string)
): RegleRuleDefinition<TValue, [], ReturnType<TRule> extends Promise<any> ? true : false>;
export function withMessage<
  TValue extends any,
  TParams extends any[],
  TAsync extends boolean = false,
>(
  rule: RegleRuleWithParamsDefinition<TValue, TParams, TAsync>,
  newMessage: string | ((value: TValue, ...args: TParams) => string)
): RegleRuleWithParamsDefinition<TValue, TParams, TAsync>;
export function withMessage<
  TValue extends any,
  TParams extends any[],
  TAsync extends boolean = false,
>(
  rule: RegleRuleDefinition<TValue, TParams, TAsync>,
  newMessage: string | ((value: TValue, ...args: TParams) => string)
): RegleRuleDefinition<TValue, TParams, TAsync>;
export function withMessage<
  TValue extends any,
  TParams extends any[],
  TAsync extends boolean = false,
>(
  rule: RegleRuleRaw<TValue, TParams, TAsync> | InlineRuleDeclaration<TValue>,
  newMessage: string | ((value: any, ...args: any[]) => string)
):
  | RegleRuleWithParamsDefinition<TValue, TParams, TAsync>
  | RegleRuleDefinition<TValue, TParams, TAsync> {
  let _type: string | undefined;
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
    validator: validator as any,
    active: _active,
    message: newMessage,
  });

  newRule._params = _params as any;
  newRule._patched = true;

  return newRule as any;
}
