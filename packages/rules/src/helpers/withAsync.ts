import type { Ref } from 'vue';
import type {
  InlineRuleDeclaration,
  RegleRuleDefinition,
  RegleRuleMetadataDefinition,
  UnwrapRegleUniversalParams,
} from '@regle/core';
import { createRule, InternalRuleType } from '@regle/core';

export function withAsync<
  TValue,
  TParams extends (Ref<unknown> | (() => unknown))[] = [],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition> =
    | RegleRuleMetadataDefinition
    | Promise<RegleRuleMetadataDefinition>,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
>(
  rule: InlineRuleDeclaration<TValue, TParams, TReturn>,
  depsArray?: [...TParams]
): RegleRuleDefinition<TValue, UnwrapRegleUniversalParams<TParams>, true, TMetadata> {
  const validator = async (value: any | null | undefined, ...params: any[]) => {
    return rule(value, ...(params as any));
  };

  const newRule = createRule({
    type: InternalRuleType.Async,
    validator: validator as any,
    message: '',
  });

  newRule._params = newRule._params?.concat(depsArray);

  return newRule(...(depsArray ?? [])) as any;
}
