import type {
  InlineRuleDeclaration,
  RegleRuleDefinition,
  RegleRuleMetadataDefinition,
  UnwrapRegleUniversalParams,
} from '@regle/core';
import { createRule, InternalRuleType } from '@regle/core';
import { type Ref } from 'vue';

/**
 * The withParams wrapper allows your rule to depend on external parameters, such as a reactive property in your component or store.
 *
 * By default, useRegle observes changes automatically when rules are defined using getter functions or computed properties.
 * 
 * ```ts
 * import { withParams } from '@regle/rules';

    const base = ref('foo');

    const { r$ } = useRegle({ name: '' }, {
      name: {
        customRule: withParams((value, param) => value === param, [base]),
        // or
        customRule: withParams((value, param) => value === param, [() => base.value]),
      }
    })
 * ```
 * Docs: {@link https://reglejs.dev/core-concepts/rules/rule-wrappers#withparams}
 */
export function withParams<
  TValue,
  TParams extends (Ref<unknown> | (() => unknown))[] = [],
  TReturn extends RegleRuleMetadataDefinition = RegleRuleMetadataDefinition,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  rule: InlineRuleDeclaration<TValue, TParams, TReturn>,
  depsArray: [...TParams]
): RegleRuleDefinition<TValue, UnwrapRegleUniversalParams<TParams>, TAsync, TMetadata> {
  const validator = (value: any | null | undefined, ...params: any[]) => {
    return rule(value, ...(params as any));
  };

  const newRule = createRule({
    type: InternalRuleType.Inline,
    validator: validator,
    message: '',
  });

  newRule._params = newRule._params?.concat(depsArray);

  return newRule(...depsArray) as any;
}
