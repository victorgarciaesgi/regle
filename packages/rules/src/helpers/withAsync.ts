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
import type { Ref } from 'vue';
import { extractValidator } from './common/extractValidator';

/**
 * `withAsync` works like `withParams`, but is specifically designed for async rules that depend on external values.
 *
 * @param rule - The async rule function
 * @param depsArray - Array of reactive dependencies (refs or getters)
 *
 * @example
 * ```ts
 * import { withAsync } from '@regle/rules';
 *
 * const base = ref('foo');
 *
 * const { r$ } = useRegle({ name: '' }, {
 *   name: {
 *     customRule: withAsync(async (value, param) => {
 *       await someAsyncCall(param)
 *     }, [base])
 *   }
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/rule-wrappers#withasync Documentation}
 */
export function withAsync<
  TValue,
  TParams extends (Ref<unknown> | (() => unknown))[] = [],
  TReturn extends Promise<RegleRuleMetadataDefinition> = Promise<RegleRuleMetadataDefinition>,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
>(
  rule: InlineRuleDeclaration<TValue, TParams, TReturn>,
  depsArray?: [...TParams]
): RegleRuleDefinition<unknown, TValue, UnwrapRegleUniversalParams<TParams>, true, TMetadata>;
export function withAsync<
  TType extends string | unknown,
  TValue extends any,
  TParams extends any[],
  TMetadata extends RegleRuleMetadataDefinition,
>(
  rule: RegleRuleWithParamsDefinition<TType, TValue, TParams, true, TMetadata>,
  depsArray?: [...TParams]
): RegleRuleWithParamsDefinition<TType, TValue, TParams, true, TMetadata>;
export function withAsync(
  rule: RegleRuleRaw<any, any, any, any> | InlineRuleDeclaration<any, any, any>,
  depsArray?: any[]
): RegleRuleWithParamsDefinition<unknown, any, any, true, any> | RegleRuleDefinition<unknown, any, any, true, any> {
  let validator: RegleRuleDefinitionProcessor<any, any, any>;
  const { _type, _params, _message, _active } = extractValidator(rule);

  if (typeof rule === 'function') {
    validator = async (value: any | null | undefined, ...params: any[]) => {
      return rule(value, ...(params as []));
    };
  } else {
    validator = async (...args: any[]) => rule.validator(args);
  }

  const augmentedParams = (_params ?? [])?.concat(depsArray);

  const newRule = createRule({
    type: _type ?? InternalRuleType.Async,
    validator: validator,
    message: _message,
    async: true,
    active: _active,
  });

  newRule._params = augmentedParams;

  return newRule(...(depsArray ?? [])) as any;
}
