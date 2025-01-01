import type {
  InlineRuleDeclaration,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  RegleRuleMetadataDefinition,
  RegleRuleMetadataConsumer,
  RegleRuleDefinitionWithMetadataProcessor,
  RegleRuleRaw,
  Maybe,
} from '@regle/core';
import { createRule, InternalRuleType, unwrapRuleParameters } from '@regle/core';
import type { MaybeRefOrGetter } from 'vue';

export function applyIf<
  TValue extends any,
  TParams extends any[],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition> = RegleRuleMetadataDefinition,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  _condition: MaybeRefOrGetter<Maybe<boolean>>,
  rule: InlineRuleDeclaration<TValue, TParams, TReturn> | RegleRuleDefinition<TValue, TParams, TAsync, TMetadata>
): RegleRuleDefinition<TValue, [...TParams, condition: boolean], TAsync, TMetadata> {
  let _type: string | undefined;
  let validator: RegleRuleDefinitionProcessor<any, any, any>;
  let _params: any[] | undefined = [];
  let _message: RegleRuleDefinitionWithMetadataProcessor<
    any,
    RegleRuleMetadataConsumer<any, any>,
    string | string[]
  > = '';

  if (typeof rule === 'function') {
    _type = InternalRuleType.Inline;
    validator = rule;
    _params = [_condition];
  } else {
    ({ _type, validator, _message } = rule);
    _params = rule._params?.concat([_condition] as any);
  }

  function newValidator(value: any, ...args: any[]) {
    const [condition] = unwrapRuleParameters<[boolean]>([_condition]);
    if (condition) {
      return validator(value, ...args);
    }
    return true;
  }

  function newActive(metadata: RegleRuleMetadataConsumer<any[], any>) {
    const [condition] = unwrapRuleParameters<[boolean]>([_condition]);
    return condition;
  }

  const newRule = createRule({
    type: _type as any,
    validator: newValidator,
    active: newActive,
    message: _message,
  }) as RegleRuleRaw;

  const newParams = [...(_params ?? [])] as [];
  newRule._params = newParams as any;

  if (typeof newRule === 'function') {
    const executedRule = newRule(...newParams);
    executedRule._message_patched = true;
    return executedRule as any;
  } else {
    return newRule as any;
  }
}
