import { createRule } from '..';
import {
  InferRegleRule,
  InlineRuleDeclaration,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  RegleRuleRaw,
  RegleRuleWithParamsDefinition,
} from '../types';

export function withMessage<TValue extends any, TParams extends any[]>(
  rule: InlineRuleDeclaration<TValue, TParams>,
  newMessage: string | ((value: TValue, ...args: TParams) => string)
): RegleRuleDefinition<TValue, TParams>;
export function withMessage<TValue extends any, TParams extends any[]>(
  rule: RegleRuleWithParamsDefinition<TValue, TParams>,
  newMessage: string | ((value: TValue, ...args: TParams) => string)
): RegleRuleWithParamsDefinition<TValue, TParams>;
export function withMessage<TValue extends any, TParams extends any[]>(
  rule: RegleRuleDefinition<TValue, TParams>,
  newMessage: string | ((value: TValue, ...args: TParams) => string)
): RegleRuleDefinition<TValue, TParams>;
export function withMessage<TValue extends any, TParams extends any[]>(
  rule: RegleRuleRaw<TValue, TParams> | InlineRuleDeclaration<TValue, TParams>,
  newMessage: string | ((value: any, ...args: any[]) => string)
): RegleRuleWithParamsDefinition<TValue, TParams> | RegleRuleDefinition<TValue, TParams> {
  let _type: string;
  let validator: RegleRuleDefinitionProcessor<TValue, TParams, boolean>;
  let _active: boolean | RegleRuleDefinitionProcessor<TValue, TParams, boolean> | undefined;

  if (typeof rule === 'function' && !('_validator' in rule)) {
    _type = '__inline';
    validator = rule;
  } else {
    ({ _type, validator, _active } = rule);
  }

  const newRule = createRule<TValue, TParams>({
    type: _type,
    validator: validator,
    active: _active,
    message: newMessage,
  });

  newRule._patched = true;

  return newRule;
}
