import {ValidationRuleWithParams, ValidationRuleWithoutParams, ValidatorFn} from '@vuelidate/core';
import {helpers, MessageProps} from '@vuelidate/validators';
import {PartialValidationTree, TypedRuleDecl} from '../core/types';

/** Vuelidate Type utils overrides, missing params generics in source */
export type ValidationRule<P extends Record<string, any>, T = any> = ValidationRuleWithParams<P, T> | ValidationRuleWithoutParams<T> | ValidatorFn<T>;
export type ValidationRuleCollection<P extends Record<string, any>, T = any> = Record<string, ValidationRule<P, T>>;
export type ValidationArgs<P extends Record<string, any>, T = unknown> = {
    [key in keyof T]: ValidationArgs<P, T[key]> | ValidationRuleCollection<P, T[key]> | ValidationRule<P, T[key]>;
};

/** Vuelidate helpers overrides, they are not greatly typed in source */

export const withParams: <P extends Record<string, any>, T = any>(params: P, validator: ValidationRule<P, T>) => ValidationRuleWithParams<P, T> =
    helpers.withParams as any;

export const withMessage: <P extends Record<string, any>, T = any>(
    message: string | ((params: MessageProps) => string),
    validator: ValidationRule<P, T>,
) => ValidationRuleWithParams<P, T> = helpers.withMessage as any;

export const req: (value: any) => boolean = helpers.req as any;
export const regex: (value: RegExp) => boolean = helpers.regex as any;

export const withAsync: <T, TValidator extends ValidatorFn<any, T>>(factory: TValidator) => ValidationRule<any, T> = helpers.withAsync as any;

export const forEach: <P extends any, T = any>(validators: P extends Record<string, any> ? PartialValidationTree<P, any> : TypedRuleDecl<P>) => any =
    helpers.forEach as any;
