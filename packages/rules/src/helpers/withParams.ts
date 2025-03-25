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
  rule: InlineRuleDeclaration<TValue, TParams, TReturn> | RegleRuleDefinition<TValue, any[], TAsync, TMetadata>,
  depsArray: [...TParams]
): RegleRuleDefinition<TValue, UnwrapRegleUniversalParams<TParams>, TAsync, TMetadata>;
export function withParams<
  TValue extends any,
  TParams extends any[],
  TMetadata extends RegleRuleMetadataDefinition,
  TReturn extends TMetadata | Promise<TMetadata>,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  rule: RegleRuleWithParamsDefinition<TValue, TParams, TAsync, TMetadata>,
  depsArray: [...TParams]
): RegleRuleWithParamsDefinition<TValue, TParams, TAsync, TReturn extends Promise<infer M> ? M : TReturn>;
export function withParams(
  rule: RegleRuleRaw<any, any, any, any> | InlineRuleDeclaration<any, any, any>,
  depsArray: any[]
): RegleRuleWithParamsDefinition<any, any, any, any> | RegleRuleDefinition<any, any, any, any> {
  let _type: string | undefined;
  let validator: RegleRuleDefinitionProcessor<any, any, any>;
  let _params: any[] | undefined = [];
  let _message: RegleRuleDefinitionWithMetadataProcessor<
    any,
    RegleRuleMetadataConsumer<any, any[]>,
    string | string[]
  > = '';

  if (typeof rule === 'function') {
    _type = InternalRuleType.Inline;
    validator = (value: any | null | undefined, ...params: any[]) => {
      return rule(value, ...(params as []));
    };
    _params = [depsArray];
  } else {
    ({ _type, validator, _message } = rule);
    _params = _params = rule._params?.concat(depsArray as any);
  }

  const newRule = createRule({
    type: InternalRuleType.Inline,
    validator: validator,
    message: _message,
  });

  newRule._params = newRule._params?.concat(_params);

  return newRule(...depsArray) as any;
}
