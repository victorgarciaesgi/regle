import type { EnumLike, Maybe, RegleRuleDefinition, RegleRuleWithParamsDefinition } from '../types';

export interface CommonComparationOptions {
  /**
   * Change the behaviour of the rule to check only if the value is equal in addition to be strictly superior or inferior
   * @default true
   */
  allowEqual?: boolean;
}

export type DefaultValidators = {
  alpha: RegleRuleWithParamsDefinition<string, [allowSymbols?: boolean | undefined]>;
  alphaNum: RegleRuleWithParamsDefinition<string | number, [allowSymbols?: boolean | undefined]>;
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
  exactValue: RegleRuleWithParamsDefinition<number, [count: number], false, boolean>;
  integer: RegleRuleDefinition<string | number, [], false, boolean, string | number>;
  ipv4Address: RegleRuleDefinition<string, [], false, boolean, string>;
  literal: RegleRuleDefinition<string | number, [literal: string | number], false, boolean, string | number>;
  macAddress: RegleRuleWithParamsDefinition<string, [separator?: string | undefined], false, boolean>;
  maxLength: RegleRuleWithParamsDefinition<
    string | any[] | Record<PropertyKey, any>,
    [count: number, options?: CommonComparationOptions],
    false,
    boolean
  >;
  maxValue: RegleRuleWithParamsDefinition<number, [count: number, options?: CommonComparationOptions], false, boolean>;
  minLength: RegleRuleWithParamsDefinition<
    string | any[] | Record<PropertyKey, any>,
    [count: number, options?: CommonComparationOptions],
    false,
    boolean
  >;
  minValue: RegleRuleWithParamsDefinition<number, [count: number, options?: CommonComparationOptions], false, boolean>;
  nativeEnum: RegleRuleDefinition<string | number, [enumLike: EnumLike], false, boolean, string | number>;
  numeric: RegleRuleDefinition<string | number, [], false, boolean, string | number>;
  oneOf: RegleRuleDefinition<string | number, [options: (string | number)[]], false, boolean, string | number>;
  regex: RegleRuleWithParamsDefinition<string, [regexp: RegExp], false, boolean>;
  required: RegleRuleDefinition<unknown, []>;
  sameAs: RegleRuleWithParamsDefinition<unknown, [target: unknown, otherName?: string], false, boolean>;
  startsWith: RegleRuleWithParamsDefinition<string, [part: Maybe<string>], false, boolean>;
  url: RegleRuleDefinition<string, [], false, boolean, string>;
};
