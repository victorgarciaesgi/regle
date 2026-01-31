import type {
  InlineRuleDeclaration,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  RegleRuleMetadataDefinition,
  RegleRuleRaw,
  RegleRuleWithParamsDefinition,
  UnwrapRegleUniversalParams,
} from '@regle/core';
import { createRule, InternalRuleType } from '@regle/core';
import { type Ref } from 'vue';
import { extractValidator } from './common/extractValidator';

/**
 * The `withParams` wrapper allows your rule to depend on external parameters,
 * such as a reactive property in your component or store.
 *
 * By default, `useRegle` observes changes automatically when rules are defined using getter functions or computed properties.
 * However, sometimes dependencies cannot be tracked automatically; use `withParams` to manually define them.
 *
 * @param rule - The rule function or definition
 * @param depsArray - Array of reactive dependencies (refs or getters)
 *
 * @example
 * ```ts
 * import { withParams } from '@regle/rules';
 *
 * const base = ref('foo');
 *
 * const { r$ } = useRegle({ name: '' }, {
 *   name: {
 *     customRule: withParams((value, param) => value === param, [base]),
 *     // or with getter
 *     customRule: withParams((value, param) => value === param, [() => base.value]),
 *   }
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/rule-wrappers#withparams Documentation}
 */
export function withParams<
  TType extends string | unknown,
  TValue,
  TParams extends (Ref<unknown> | (() => unknown))[] = [],
  TReturn extends RegleRuleMetadataDefinition = RegleRuleMetadataDefinition,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  rule: InlineRuleDeclaration<TValue, TParams, TReturn> | RegleRuleDefinition<TType, TValue, any[], TAsync, TMetadata>,
  depsArray: [...TParams]
): RegleRuleDefinition<TType, TValue, UnwrapRegleUniversalParams<TParams>, TAsync, TMetadata>;
export function withParams<
  TType extends string | unknown,
  TValue extends any,
  TParams extends any[],
  TReturn extends RegleRuleMetadataDefinition = RegleRuleMetadataDefinition,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  rule: RegleRuleWithParamsDefinition<TType, TValue, TParams, TAsync, TMetadata>,
  depsArray: [...TParams]
): RegleRuleWithParamsDefinition<TType, TValue, TParams, TAsync, TMetadata>;
export function withParams(
  rule: RegleRuleRaw<any, any, any, any> | InlineRuleDeclaration<any, any, any>,
  depsArray: any[]
): RegleRuleWithParamsDefinition<unknown, any, any, any, any> | RegleRuleDefinition<unknown, any, any, any, any> {
  let validator: RegleRuleDefinitionProcessor<any, any, any>;
  const { _type, _params, _message, _active, _async } = extractValidator(rule);

  if (typeof rule === 'function') {
    validator = (value: any | null | undefined, ...params: any[]) => {
      return rule(value, ...(params as []));
    };
  } else {
    validator = rule.validator;
  }

  const augmentedParams = (_params ?? [])?.concat(depsArray);

  const newRule = createRule({
    type: _type ?? InternalRuleType.Inline,
    validator: validator,
    message: _message,
    active: _active,
    async: _async,
  });

  newRule._params = augmentedParams;

  return newRule(...depsArray) as any;
}
