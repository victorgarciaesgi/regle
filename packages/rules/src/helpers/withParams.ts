import type { Ref } from 'vue';
import type {
  InlineRuleDeclaration,
  RegleRuleDefinition,
  RegleRuleMetadataDefinition,
  UnwrapRegleUniversalParams,
} from '@regle/core';
import { createRule, defineType, InternalRuleType } from '@regle/core';

export function withParams<
  TValue,
  TParams extends (Ref<unknown> | (() => unknown))[] = [],
  TReturn extends RegleRuleMetadataDefinition = RegleRuleMetadataDefinition,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
>(
  rule: InlineRuleDeclaration<TValue, TReturn>,
  depsArray: [...TParams]
): RegleRuleDefinition<TValue, UnwrapRegleUniversalParams<TParams>, true, TMetadata> {
  const validator = async (value: any | null | undefined) => {
    return rule(value);
  };

  const newRule = createRule({
    type: defineType<any>(InternalRuleType.Inline),
    validator: validator as any,
    message: '',
  });

  newRule._params = depsArray as any;

  return newRule as any;
}
