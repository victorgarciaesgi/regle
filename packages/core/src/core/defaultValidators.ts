import { RegleRuleDefinition, RegleRuleWithParamsDefinition } from '../types';

export type DefaultValidators = {
  maxLength: RegleRuleWithParamsDefinition<string, [count: number]>;
  required: RegleRuleDefinition<unknown, []>;
  requiredIf: RegleRuleWithParamsDefinition<unknown, [condition: boolean]>;
  requiredUnless: RegleRuleWithParamsDefinition<unknown, [condition: boolean]>;
  alpha: RegleRuleDefinition<string>;
  alphaNum: RegleRuleDefinition<string | number>;
  between: RegleRuleWithParamsDefinition<number, [min: number, max: number]>;
  decimal: RegleRuleDefinition<number | string>;
  email: RegleRuleDefinition<string>;
  integer: RegleRuleDefinition<number | string>;
  maxValue: RegleRuleWithParamsDefinition<number, [count: number]>;
  minLength: RegleRuleWithParamsDefinition<
    string | Record<PropertyKey, any> | any[],
    [count: number]
  >;
  minValue: RegleRuleWithParamsDefinition<number, [count: number]>;
  numeric: RegleRuleDefinition<number | string>;
  sameAs: RegleRuleWithParamsDefinition<unknown, [target: unknown]>;
  url: RegleRuleDefinition<string>;
  dateAfter: RegleRuleWithParamsDefinition<Date, [after: Date]>;
  dateBefore: RegleRuleWithParamsDefinition<Date, [before: Date]>;
  dateBetween: RegleRuleWithParamsDefinition<Date, [before: Date, after: Date]>;
  ipAddress: RegleRuleDefinition<string, [], false>;
  macAddress: RegleRuleWithParamsDefinition<string, [separator?: string | undefined], false>;
};
