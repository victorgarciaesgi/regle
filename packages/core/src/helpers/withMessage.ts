import { createRule } from '..';
import { InferShibieRule, ShibieInternalRuleDefs, ShibieRule } from '../types';

export function withMessage<
  TValue extends any,
  TParams extends any[],
  TNewParams extends any[],
  TNewMessage extends string | ((value: TValue, ...params: TNewParams) => string),
>(rule: ShibieRule<TValue, TParams>, newMessage: TNewMessage): InferShibieRule<TValue, TNewParams> {
  const { _message, _type, _validator, _active } = rule as unknown as ShibieInternalRuleDefs<
    TValue,
    TParams
  >;

  return createRule({
    type: _type,
    validator: _validator,
    active: _active,
    message: newMessage as unknown as any,
  }) as any;
}
