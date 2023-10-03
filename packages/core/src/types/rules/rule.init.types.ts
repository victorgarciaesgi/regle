import { Maybe } from '../utils';

/**
 * @argument
 * createRule arguments options
 */
export interface ShibieRuleInit<TValue extends any, TParams extends any[] = []> {
  validator: (value: Maybe<TValue>, ...args: TParams) => boolean;
  message: string | ((value: Maybe<TValue>, ...args: TParams) => string);
  active?: boolean | ((value: Maybe<TValue>, ...args: TParams) => boolean);
  type: string;
}
