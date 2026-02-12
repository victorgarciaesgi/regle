import type { EnumLike, MaybeInput, RegleRuleDefinition, RegleRuleWithParamsDefinition } from '../types';

export interface CommonComparisonOptions {
  /**
   * Change the behaviour of the rule to check only if the value is equal in addition to be strictly superior or inferior
   * @default true
   */
  allowEqual?: boolean;
}

export interface CommonAlphaOptions {
  /**
   * Allow symbols in alphabetical-like rules (like "_")
   * @default true
   */
  allowSymbols?: boolean;
}

export interface UrlOptions {
  /**
   * Optional regex for validating the URL protocol
   */
  protocol?: RegExp;
}

export type DefaultValidators = {
  alpha: RegleRuleWithParamsDefinition<unknown, string, [options?: CommonAlphaOptions | undefined]>;
  alphaNum: RegleRuleWithParamsDefinition<unknown, string | number, [options?: CommonAlphaOptions | undefined]>;
  atLeastOne: RegleRuleWithParamsDefinition<
    unknown,
    Record<string, unknown> | object,
    [keys?: readonly string[] | undefined],
    false,
    boolean,
    false,
    Record<string, unknown> | object
  >;
  between: RegleRuleWithParamsDefinition<
    unknown,
    number,
    [min: number, max: number, options?: CommonComparisonOptions]
  >;
  boolean: RegleRuleDefinition<unknown, unknown, [], false, boolean, any, unknown>;
  checked: RegleRuleDefinition<unknown, boolean, [], false, boolean, boolean>;
  contains: RegleRuleWithParamsDefinition<unknown, string, [part: MaybeInput<string>], false, boolean>;
  date: RegleRuleDefinition<unknown, unknown, [], false, boolean, MaybeInput<Date>, unknown>;
  dateAfter: RegleRuleWithParamsDefinition<
    unknown,
    string | Date,
    [after: MaybeInput<string | Date>, options?: CommonComparisonOptions],
    false,
    | true
    | {
        $valid: false;
        error: 'date-not-after';
      }
    | {
        $valid: false;
        error: 'value-or-parameter-not-a-date';
      }
  >;
  dateBefore: RegleRuleWithParamsDefinition<
    unknown,
    string | Date,
    [before: MaybeInput<string | Date>, options?: CommonComparisonOptions],
    false,
    | true
    | {
        $valid: false;
        error: 'date-not-before';
      }
    | {
        $valid: false;
        error: 'value-or-parameter-not-a-date';
      }
  >;
  dateBetween: RegleRuleWithParamsDefinition<
    unknown,
    string | Date,
    [before: MaybeInput<string | Date>, after: MaybeInput<string | Date>, options?: CommonComparisonOptions],
    false,
    boolean
  >;
  decimal: RegleRuleDefinition<unknown, string | number, [], false, boolean, string | number>;
  email: RegleRuleDefinition<unknown, string, [], false, boolean, string>;
  endsWith: RegleRuleWithParamsDefinition<unknown, string, [part: MaybeInput<string>], false, boolean>;
  exactLength: RegleRuleWithParamsDefinition<
    unknown,
    string | any[] | Record<PropertyKey, any>,
    [count: number],
    false,
    boolean
  >;
  exactValue: RegleRuleWithParamsDefinition<unknown, number, [count: number], false, boolean>;
  file: RegleRuleDefinition<unknown, unknown, [], false, boolean, MaybeInput<File>, unknown>;
  fileType: RegleRuleWithParamsDefinition<unknown, File, [accept: readonly string[]], false, boolean>;
  hexadecimal: RegleRuleDefinition<unknown, string, [], false, boolean, string>;
  integer: RegleRuleDefinition<unknown, string | number, [], false, boolean, string | number>;
  ipv4Address: RegleRuleDefinition<unknown, string, [], false, boolean, string>;
  literal: RegleRuleDefinition<
    unknown,
    string | number,
    [literal: string | number],
    false,
    boolean,
    MaybeInput<string | number>,
    string | number,
    true
  >;
  macAddress: RegleRuleWithParamsDefinition<unknown, string, [separator?: string | undefined], false, boolean>;
  maxLength: RegleRuleWithParamsDefinition<
    unknown,
    string | any[] | Record<PropertyKey, any>,
    [max: number, options?: CommonComparisonOptions],
    false,
    boolean
  >;
  maxFileSize: RegleRuleWithParamsDefinition<
    unknown,
    File,
    [maxSize: number],
    false,
    | true
    | {
        $valid: boolean;
        fileSize: number;
      },
    MaybeInput<File>,
    File
  >;
  maxValue: RegleRuleWithParamsDefinition<
    unknown,
    number | string,
    [max: number | string, options?: CommonComparisonOptions],
    false,
    boolean
  >;
  minFileSize: RegleRuleWithParamsDefinition<
    unknown,
    File,
    [minSize: number],
    false,
    | true
    | {
        $valid: boolean;
        fileSize: number;
      },
    MaybeInput<File>,
    File
  >;
  minLength: RegleRuleWithParamsDefinition<
    unknown,
    string | any[] | Record<PropertyKey, any>,
    [min: number, options?: CommonComparisonOptions],
    false,
    boolean,
    string | any[] | Record<PropertyKey, any>
  >;
  minValue: RegleRuleWithParamsDefinition<
    unknown,
    number | string,
    [min: number | string, options?: CommonComparisonOptions],
    false,
    boolean
  >;
  nativeEnum: RegleRuleDefinition<unknown, string | number, [enumLike: EnumLike], false, boolean, string | number>;
  number: RegleRuleDefinition<unknown, unknown, [], false, boolean, any, unknown>;
  numeric: RegleRuleDefinition<unknown, string | number, [], false, boolean, string | number>;
  oneOf: RegleRuleDefinition<
    unknown,
    string | number,
    [options: readonly [string | number, ...(string | number)[]]],
    false,
    boolean,
    MaybeInput<string | number>,
    string | number
  >;
  regex: RegleRuleWithParamsDefinition<unknown, string | number, [regexp: RegExp | readonly RegExp[]], false, boolean>;
  required: RegleRuleDefinition<unknown, unknown, [], false, boolean, unknown, unknown, true>;
  sameAs: RegleRuleWithParamsDefinition<unknown, unknown, [target: any, otherName?: string], false, boolean>;
  string: RegleRuleDefinition<unknown, unknown, [], false, boolean, any, unknown>;
  type: RegleRuleDefinition<unknown, unknown, [], false, boolean, unknown, unknown>;
  startsWith: RegleRuleWithParamsDefinition<unknown, string, [part: MaybeInput<string>], false, boolean>;
  url: RegleRuleWithParamsDefinition<
    unknown,
    string,
    [options?: UrlOptions | undefined],
    false,
    boolean,
    unknown,
    string
  >;
};
