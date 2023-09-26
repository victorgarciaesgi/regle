/** For inline rule definition */
export type RawRuleDefinition<T extends any> = (value: T) => boolean | Promise<boolean>;

export type RuleDefinition<T extends any> = RawRuleDefinition<T> | ShibieRuleDefinition<any, any>;

/** For rules defined by `createRule` */
export type ShibieRuleDefinition<TValue extends any, TParams extends any[] = []> = {
  validator: (value: TValue, ...args: TParams) => boolean;
  message: (value: TValue, ...args: TParams) => string;
  active: (value: TValue, ...args: TParams) => boolean;
};

/** Returned type of `createRule` */
export type ShibieRule<TValue extends any, TParams extends any[] = []> = [TParams] extends [[]]
  ? ShibieRuleDefinition<TValue, TParams>
  : (...params: TParams) => ShibieRuleDefinition<TValue, TParams>;
