import type { Maybe, RegleRuleDefinition, RegleRuleWithParamsDefinition } from '../types';

export type DefaultValidators = {
  alpha: RegleRuleDefinition<string>;
  alphaNum: RegleRuleDefinition<string | number>;
  between: RegleRuleWithParamsDefinition<
    number,
    [min: Maybe<number>, max: Maybe<number>, ...args: any[]]
  >;
  checked: RegleRuleDefinition<boolean, [], false, boolean, boolean>;
  contains: RegleRuleWithParamsDefinition<
    string,
    [part: Maybe<string>, ...args: any[]],
    false,
    boolean
  >;
  dateAfter: RegleRuleWithParamsDefinition<
    string | Date,
    [after: Maybe<string | Date>, ...args: any[]],
    false,
    | true
    | {
        $valid: false;
        error: 'date-not-after';
      }
    | {
        $valid: false;
        error: 'value-or-paramater-not-a-date';
      }
  >;
  dateBefore: RegleRuleWithParamsDefinition<
    string | Date,
    [before: Maybe<string | Date>, ...args: any[]],
    false,
    | true
    | {
        $valid: false;
        error: 'date-not-before';
      }
    | {
        $valid: false;
        error: 'value-or-paramater-not-a-date';
      }
  >;
  dateBetween: RegleRuleWithParamsDefinition<
    string | Date,
    [before: Maybe<string | Date>, after: Maybe<string | Date>, ...args: any[]],
    false,
    boolean
  >;
  decimal: RegleRuleDefinition<string | number, [], false, boolean, string | number>;
  email: RegleRuleDefinition<string, [], false, boolean, string>;
  endsWith: RegleRuleWithParamsDefinition<
    string,
    [part: Maybe<string>, ...args: any[]],
    false,
    boolean
  >;
  exactLength: RegleRuleWithParamsDefinition<
    string | any[] | Record<PropertyKey, any>,
    [count: number, ...args: any[]],
    false,
    boolean
  >;
  integer: RegleRuleDefinition<string | number, [], false, boolean, string | number>;
  ipAddress: RegleRuleDefinition<string, [], false, boolean, string>;
  macAddress: RegleRuleWithParamsDefinition<
    string,
    [separator?: string | undefined, ...args: any[]],
    false,
    boolean
  >;
  maxLength: RegleRuleWithParamsDefinition<
    string | any[] | Record<PropertyKey, any>,
    [count: number, ...args: any[]],
    false,
    boolean
  >;
  maxValue: RegleRuleWithParamsDefinition<number, [count: number, ...args: any[]], false, boolean>;
  minLength: RegleRuleWithParamsDefinition<
    string | any[] | Record<PropertyKey, any>,
    [count: number, ...args: any[]],
    false,
    boolean
  >;
  minValue: RegleRuleWithParamsDefinition<number, [count: number, ...args: any[]], false, boolean>;
  numeric: RegleRuleDefinition<string | number, [], false, boolean, string | number>;
  regex: RegleRuleWithParamsDefinition<string, [regexp: RegExp, ...args: any[]], false, boolean>;
  required: RegleRuleDefinition<unknown, []>;
  sameAs: RegleRuleWithParamsDefinition<unknown, [target: unknown, ...args: any[]], false, boolean>;
  startsWith: RegleRuleWithParamsDefinition<
    string,
    [part: Maybe<string>, ...args: any[]],
    false,
    boolean
  >;
  url: RegleRuleDefinition<string, [], false, boolean, string>;
};
