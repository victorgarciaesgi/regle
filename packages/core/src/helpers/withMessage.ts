import { createRule } from '..';
import {
  InferShibieRule,
  InlineRuleDeclaration,
  ShibieRuleDefinition,
  ShibieRuleDefinitionProcessor,
  ShibieRuleRaw,
  ShibieRuleWithParamsDefinition,
} from '../types';

export function withMessage<TValue extends any, TParams extends any[]>(
  rule: InlineRuleDeclaration<TValue, TParams>,
  newMessage: string | ((value: TValue, ...args: TParams) => string)
): ShibieRuleDefinition<TValue, TParams>;
export function withMessage<TValue extends any, TParams extends any[]>(
  rule: ShibieRuleWithParamsDefinition<TValue, TParams>,
  newMessage: string | ((value: TValue, ...args: TParams) => string)
): ShibieRuleWithParamsDefinition<TValue, TParams>;
export function withMessage<TValue extends any, TParams extends any[]>(
  rule: ShibieRuleDefinition<TValue, TParams>,
  newMessage: string | ((value: TValue, ...args: TParams) => string)
): ShibieRuleDefinition<TValue, TParams>;
export function withMessage<TValue extends any, TParams extends any[]>(
  rule: ShibieRuleRaw<TValue, TParams> | InlineRuleDeclaration<TValue, TParams>,
  newMessage: string | ((value: any, ...args: any[]) => string)
): ShibieRuleWithParamsDefinition<TValue, TParams> | ShibieRuleDefinition<TValue, TParams> {
  let _type: string;
  let validator: ShibieRuleDefinitionProcessor<TValue, TParams, boolean>;
  let _active: boolean | ShibieRuleDefinitionProcessor<TValue, TParams, boolean> | undefined;

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
