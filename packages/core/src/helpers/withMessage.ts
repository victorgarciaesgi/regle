import { createRule } from '..';
import { InferShibieRule, ShibieRuleDefinition, ShibieRuleRaw } from '../types';

export function withMessage<TValue extends any, TParams extends any[]>(
  rule: ShibieRuleDefinition<TValue, TParams>,
  newMessage: string | ((value: TValue, ...args: TParams) => string)
): InferShibieRule<TValue, TParams> {
  const { _type, _validator, _active } = rule;

  const newRule = createRule<TValue, TParams>({
    type: _type,
    validator: _validator,
    active: _active,
    message: newMessage,
  });

  newRule._patched = true;

  return newRule;
}
