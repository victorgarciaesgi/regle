import type { DefaultValidators } from '../../core';
import type { useRegleFn } from '../../core/useRegle';
import type { Regle } from '../core';
import type { AllRulesDeclarations, UnwrapRuleTree, UnwrapRuleWithParams } from '../rules';
import type { Prettify } from './misc.types';

export type InferRegleRoot<T extends (...args: any[]) => Regle<any, any, any, any>> = T extends (
  ...args: any[]
) => infer U
  ? U extends Regle<any, any, any, any>
    ? Prettify<U['r$']>
    : never
  : never;

export type InferRegleRules<T extends useRegleFn<any, any>> =
  T extends useRegleFn<infer U, any> ? UnwrapRuleTree<Partial<U> & Partial<DefaultValidators>> : {};

export type InferRegleShortcuts<T extends useRegleFn<any, any>> = T extends useRegleFn<any, infer U> ? U : {};

export type RegleEnforceRequiredRules<TRules extends keyof DefaultValidators> = {
  [K in TRules]-?: UnwrapRuleWithParams<DefaultValidators[K]>;
};

export type RegleEnforceCustomRequiredRules<
  T extends Partial<AllRulesDeclarations> | useRegleFn<any, any>,
  TRules extends T extends useRegleFn<any, any> ? keyof InferRegleRules<T> : keyof T,
> = {
  [K in TRules]-?: T extends useRegleFn<any>
    ? K extends keyof InferRegleRules<T>
      ? UnwrapRuleWithParams<InferRegleRules<T>[K]>
      : never
    : K extends keyof T
      ? NonNullable<T[K]>
      : never;
};
