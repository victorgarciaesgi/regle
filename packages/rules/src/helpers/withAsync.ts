import type { Ref } from 'vue';
import type {
  InlineRuleDeclaration,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  RegleRuleDefinitionWithMetadataProcessor,
  RegleRuleMetadataConsumer,
  RegleRuleMetadataDefinition,
  RegleRuleRaw,
  RegleRuleWithParamsDefinition,
  UnwrapRegleUniversalParams,
} from '@regle/core';
import { createRule, InternalRuleType } from '@regle/core';

/**
 * withAsync works like withParams, but is specifically designed for async rules that depend on external values.
 * 
 * ```ts
 *import { withAsync } from '@regle/rules';

  const base = ref('foo');

  const { r$ } = useRegle({ name: '' }, {
    name: {
      customRule: withAsync(async (value, param) => {
        await someAsyncCall(param)
      }, [base])
    }
  })
 * ```
 * Docs: {@link https://reglejs.dev/core-concepts/rules/rule-wrappers#withasync}
 */
export function withAsync<
  TValue,
  TParams extends (Ref<unknown> | (() => unknown))[] = [],
  TReturn extends Promise<RegleRuleMetadataDefinition> = Promise<RegleRuleMetadataDefinition>,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
>(
  rule: InlineRuleDeclaration<TValue, TParams, TReturn>,
  depsArray?: [...TParams]
): RegleRuleDefinition<TValue, UnwrapRegleUniversalParams<TParams>, true, TMetadata>;
export function withAsync<TValue extends any, TParams extends any[], TMetadata extends RegleRuleMetadataDefinition>(
  rule: RegleRuleWithParamsDefinition<TValue, TParams, true, TMetadata>,
  depsArray?: [...TParams]
): RegleRuleWithParamsDefinition<TValue, TParams, true, TMetadata>;
export function withAsync(
  rule: RegleRuleRaw<any, any, any, any> | InlineRuleDeclaration<any, any, any>,
  depsArray?: any[]
): RegleRuleWithParamsDefinition<any, any, true, any> | RegleRuleDefinition<any, any, true, any> {
  let _type: string | undefined;
  let validator: RegleRuleDefinitionProcessor<any, any, any>;
  let _params: any[] | undefined = [];
  let _message: RegleRuleDefinitionWithMetadataProcessor<
    any,
    RegleRuleMetadataConsumer<any, any[]>,
    string | string[]
  > = '';

  if (typeof rule === 'function') {
    validator = async (value: any | null | undefined, ...params: any[]) => {
      return rule(value, ...(params as []));
    };
    _params = [depsArray];
  } else {
    ({ _type, _message } = rule);
    _params = _params = rule._params?.concat(depsArray as any);
    validator = async (...args: any[]) => rule.validator(args);
  }

  const newRule = createRule({
    type: _type ?? InternalRuleType.Async,
    validator: validator,
    message: _message,
    async: true,
  });

  newRule._params = newRule._params?.concat(_params);

  return newRule(...(depsArray ?? [])) as any;
}
