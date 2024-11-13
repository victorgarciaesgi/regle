import type { RegleRuleDefinition, RegleRuleWithParamsDefinition } from '../types';

export type DefaultValidators = {
  alpha: RegleRuleDefinition<string>;
  alphaNum: RegleRuleDefinition<string | number>;
  between: RegleRuleWithParamsDefinition<number, [min: number, max: number]>;
  checked: RegleRuleDefinition<boolean, [], false, boolean, boolean>;
  dateAfter: RegleRuleWithParamsDefinition<Date, [after: Date]>;
  dateBefore: RegleRuleWithParamsDefinition<Date, [before: Date]>;
  dateBetween: RegleRuleWithParamsDefinition<Date, [before: Date, after: Date]>;
  decimal: RegleRuleDefinition<number | string>;
  email: RegleRuleDefinition<string>;
  exactLength: RegleRuleWithParamsDefinition<
    string | any[] | Record<PropertyKey, any>,
    [count: number],
    false,
    boolean
  >;
  integer: RegleRuleDefinition<number | string>;
  ipAddress: RegleRuleDefinition<string, [], false>;
  macAddress: RegleRuleWithParamsDefinition<string, [separator?: string | undefined], false>;
  maxLength: RegleRuleWithParamsDefinition<string, [count: number]>;
  maxValue: RegleRuleWithParamsDefinition<number, [count: number]>;
  minLength: RegleRuleWithParamsDefinition<
    string | Record<PropertyKey, any> | any[],
    [count: number]
  >;
  minValue: RegleRuleWithParamsDefinition<number, [count: number]>;
  numeric: RegleRuleDefinition<number | string>;
  required: RegleRuleDefinition<unknown, []>;
  sameAs: RegleRuleWithParamsDefinition<unknown, [target: unknown]>;
  url: RegleRuleDefinition<string>;
};
