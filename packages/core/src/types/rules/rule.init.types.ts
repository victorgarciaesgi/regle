import { Maybe } from '../utils';

/**
 * @argument
 * createRule arguments options
 */
export interface RegleRuleInit<
  TValue extends any,
  TParams extends any[] = [],
  TAsync extends boolean = false,
> {
  validator: (
    value: Maybe<TValue>,
    ...args: TParams
  ) => TAsync extends false ? boolean : Promise<boolean>;
  message: string | ((value: Maybe<TValue>, ...args: TParams) => string);
  active?: boolean | ((value: Maybe<TValue>, ...args: TParams) => boolean);
  type?: string;
}
