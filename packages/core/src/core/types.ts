import type {
    GlobalConfig,
    RuleResult,
    RuleResultWithParams,
    ValidationRuleWithoutParams,
    ValidationRuleWithParams,
    ValidatorFn,
} from '@vuelidate/core';
import type {DefaultValidators} from './defaultValidators';
import {UseFormReturnType} from './useForm';

export type UseFormOptions = {
    scrollToError?: boolean;
    editable?: boolean;
} & GlobalConfig;

// - User importable types
export type InferErrors<T extends (...args: any[]) => UseFormReturnType<any, any>> = ReturnType<T> extends UseFormReturnType<any, any, infer TRules>
    ? ValidationErrorTree<TRules>
    : never;
export type UnsafeValidationErrorTree<TData extends Record<string, any> = Record<string, any>> = {
    [K in keyof TData]: ValidationError<TData[K]>;
};

export type ValidationError<TKey extends DataType = string | Record<string, any>, TRule extends ValidationItem<any, any> | undefined = never> = [
    TKey,
] extends [never]
    ? TRule extends TypedRuleDecl<any, any>
        ? string[]
        : TRule extends PartialValidationTree<any, any>
        ? ValidationErrorTree<TRule>
        : never
    : TKey extends Array<any>
    ? string[]
    : TKey extends Date
    ? string[]
    : TKey extends Record<any, any>
    ? UnsafeValidationErrorTree<TKey>
    : string[];

// - Internal Data types
export type DataType = string | number | Record<string, any> | File | Array<any> | Date | null | undefined;
export type RuleResultRecord = Record<string, RuleResult | Promise<RuleResult>>;

export type ValidationErrorTree<TRules extends PartialValidationTree<any, any>> = {
    [K in keyof TRules]: ValidationError<never, TRules[K]>;
};

export type CustomErrorMessage = string | [string, Record<number | string, any>];

// - Rules definition
export type TypedRuleDecl<T = string, TCustomRules extends RuleResultRecord = Record<string, any>, Q = DefaultValidators & TCustomRules> = {
    [K in keyof Q]?: Q[K] extends RuleResultWithParams<infer P>
        ? ValidationRuleWithParams<P, T>
        : ValidationRuleWithParams<any, T> | ValidationRuleWithoutParams<T> | ValidatorFn<T>;
};

export type PartialValidationTree<T extends Record<string, any>, TCustomRules extends RuleResultRecord> = {
    [K in keyof T]?: ValidationItem<T[K], TCustomRules>;
};

export type ValidationItem<T extends DataType, TCustomRules extends RuleResultRecord> = NonNullable<T> extends Array<infer A>
    ? TypedRuleDecl<NonNullable<T>, TCustomRules, DefaultValidators & TCustomRules> & {
          $each?: TypedRuleDecl<A, TCustomRules>;
      }
    : NonNullable<T> extends Date
    ? TypedRuleDecl<NonNullable<T>, TCustomRules>
    : NonNullable<T> extends File
    ? TypedRuleDecl<NonNullable<T>, TCustomRules>
    : NonNullable<T> extends Record<string, any>
    ? PartialValidationTree<NonNullable<T>, TCustomRules>
    : TypedRuleDecl<NonNullable<T>, TCustomRules>;

export type UnwrapStateTree<T extends Record<string, any>> = {
    [K in keyof T]: T[K] extends Record<string, any> | undefined ? UnwrapStateTree<T[K]> : T[K];
};
