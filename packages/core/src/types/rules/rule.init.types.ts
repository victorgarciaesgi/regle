import { Maybe } from '../utils';

/**
 * @argument
 * createRule arguments options
 */
export interface RegleRuleInit<
  TValue extends any,
  TParams extends any[] = [],
  TType extends string = string,
> {
  validator: (value: Maybe<TValue>, ...args: TParams) => boolean | Promise<boolean>;
  message: string | ((value: Maybe<TValue>, ...args: TParams) => string);
  active?: boolean | ((value: Maybe<TValue>, ...args: TParams) => boolean);
  type: TType;
}
