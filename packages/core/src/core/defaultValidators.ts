import type { Maybe, RegleRuleDefinition, RegleRuleWithParamsDefinition } from '../types';

export type DefaultValidators = {
  alpha: RegleRuleDefinition<string>;
  alphaNum: RegleRuleDefinition<string | number>;
  between: RegleRuleWithParamsDefinition<number, [min: Maybe<number>, max: Maybe<number>]>;
  checked: RegleRuleDefinition<boolean, [], false, boolean, boolean>;
  contains: RegleRuleWithParamsDefinition<string, [part: Maybe<string>], false, boolean>;
  dateAfter: RegleRuleWithParamsDefinition<
    string | Date,
    [after: Maybe<string | Date>],
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
    [before: Maybe<string | Date>],
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
    [before: Maybe<string | Date>, after: Maybe<string | Date>],
    false,
    boolean
  >;
  decimal: RegleRuleDefinition<string | number, [], false, boolean, string | number>;
  email: RegleRuleDefinition<string, [], false, boolean, string>;
  endsWith: RegleRuleWithParamsDefinition<string, [part: Maybe<string>], false, boolean>;
  exactLength: RegleRuleWithParamsDefinition<
    string | any[] | Record<PropertyKey, any>,
    [count: number],
    false,
    boolean
  >;
  integer: RegleRuleDefinition<string | number, [], false, boolean, string | number>;
  ipAddress: RegleRuleDefinition<string, [], false, boolean, string>;
  macAddress: RegleRuleWithParamsDefinition<
    string,
    [separator?: string | undefined],
    false,
    boolean
  >;
  maxLength: RegleRuleWithParamsDefinition<
    string | any[] | Record<PropertyKey, any>,
    [count: number],
    false,
    boolean
  >;
  maxValue: RegleRuleWithParamsDefinition<number, [count: number], false, boolean>;
  minLength: RegleRuleWithParamsDefinition<
    string | any[] | Record<PropertyKey, any>,
    [count: number],
    false,
    boolean
  >;
  minValue: RegleRuleWithParamsDefinition<number, [count: number], false, boolean>;
  numeric: RegleRuleDefinition<string | number, [], false, boolean, string | number>;
  regex: RegleRuleWithParamsDefinition<string, [regexp: RegExp], false, boolean>;
  required: RegleRuleDefinition<unknown, []>;
  sameAs: RegleRuleWithParamsDefinition<unknown, [target: unknown], false, boolean>;
  startsWith: RegleRuleWithParamsDefinition<string, [part: Maybe<string>], false, boolean>;
  url: RegleRuleDefinition<string, [], false, boolean, string>;
};
