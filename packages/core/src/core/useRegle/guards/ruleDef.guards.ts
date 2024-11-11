import type { Ref } from 'vue';
import type {
  $InternalFormPropertyTypes,
  $InternalRegleCollectionRuleDecl,
  $InternalReglePartialValidationTree,
  $InternalRegleRuleDecl,
  InlineRuleDeclaration,
  MaybeGetter,
  RegleRuleDefinition,
} from '../../../types';
import { isObject, unwrapGetter } from '../../../utils';

export function isNestedRulesDef(
  state: Ref<unknown>,
  rules: Ref<MaybeGetter<$InternalFormPropertyTypes>>
): rules is Ref<$InternalReglePartialValidationTree> {
  const unwrappedRules = unwrapGetter(rules.value, state.value);
  return (
    isObject(state.value) &&
    isObject(unwrappedRules) &&
    !Object.entries(unwrappedRules).some((rule) => isRuleDef(rule))
  );
}

export function isCollectionRulesDef(
  rules: Ref<MaybeGetter<$InternalFormPropertyTypes, any>>,
  state: Ref<unknown>
): rules is Ref<$InternalRegleCollectionRuleDecl> {
  const unwrappedRules = unwrapGetter(rules.value, state.value);
  return !!unwrappedRules && '$each' in unwrappedRules;
}

export function isValidatorRulesDef(
  rules: Ref<MaybeGetter<$InternalFormPropertyTypes>>
): rules is Ref<$InternalRegleRuleDecl> {
  return !!rules && isObject(rules.value);
}

export function isRuleDef(rule: unknown): rule is RegleRuleDefinition<any, any> {
  return isObject(rule) && '_validator' in rule;
}

export function isFormRuleDefinition(
  rule: Ref<unknown>
): rule is Ref<RegleRuleDefinition<any, any>> {
  return !(typeof rule.value === 'function');
}

export function isFormInline(rule: Ref<unknown>): rule is Ref<InlineRuleDeclaration<any, any>> {
  return typeof rule.value === 'function';
}
