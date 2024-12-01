import type { Ref } from 'vue';
import type {
  $InternalFormPropertyTypes,
  $InternalRegleCollectionRuleDecl,
  $InternalReglePartialRuleTree,
  $InternalRegleRuleDecl,
  InlineRuleDeclaration,
  MaybeGetter,
  RegleRuleDefinition,
} from '../../../types';
import { isObject, unwrapGetter } from '../../../utils';

export function isNestedRulesDef(
  state: Ref<unknown>,
  rules: Ref<$InternalFormPropertyTypes>
): rules is Ref<$InternalReglePartialRuleTree> {
  return (
    isObject(state.value) &&
    isObject(rules.value) &&
    !Object.entries(rules.value).some((rule) => isRuleDef(rule))
  );
}

export function isCollectionRulesDef(
  rules: Ref<$InternalFormPropertyTypes, any>,
  state: Ref<unknown>
): rules is Ref<$InternalRegleCollectionRuleDecl> {
  return (!!rules.value && '$each' in rules.value) || Array.isArray(state.value);
}

export function isValidatorRulesDef(
  rules: Ref<$InternalFormPropertyTypes>
): rules is Ref<$InternalRegleRuleDecl> {
  return !!rules.value && isObject(rules.value);
}

export function isRuleDef(rule: unknown): rule is RegleRuleDefinition<any, any> {
  return isObject(rule) && '_validator' in rule;
}

export function isFormRuleDefinition(
  rule: Ref<unknown>
): rule is Ref<RegleRuleDefinition<any, any>> {
  return !(typeof rule.value === 'function');
}

export function isFormInline(
  rule: Ref<unknown>
): rule is Ref<InlineRuleDeclaration<any, any[], any>> {
  return typeof rule.value === 'function';
}

export function isStateArray(state: Ref<unknown>): state is Ref<(unknown & { $id?: string })[]> {
  return Array.isArray(state.value);
}
