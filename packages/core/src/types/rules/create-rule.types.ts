/**
 * @argument
 * createRule arguments options
 */
export interface ShibieRuleInit<TValue extends any, TParams extends any[] = []> {
  validator: (value: TValue, ...args: TParams) => boolean;
  message: string | ((value: TValue, ...args: TParams) => string);
  active?: boolean | ((value: TValue, ...args: TParams) => boolean);
  type: string;
}
