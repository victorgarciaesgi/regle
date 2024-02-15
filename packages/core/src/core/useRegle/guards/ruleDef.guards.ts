import type { Ref } from 'vue';
import type {
  $InternalFormPropertyTypes,
  $InternalRegleCollectionRuleDecl,
  $InternalReglePartialValidationTree,
  $InternalRegleRuleDecl,
  InlineRuleDeclaration,
  RegleRuleDefinition,
} from '../../../types';
import { isObject } from '../../../utils';

export function isNestedRulesDef(
  state: Ref<unknown>,
  rule: Ref<$InternalFormPropertyTypes>
): rule is Ref<$InternalReglePartialValidationTree> {
  return (
    isObject(state.value) &&
    isObject(rule.value) &&
    !Object.entries(rule.value).some((rule) => isRuleDef(rule))
  );
}

export function isCollectionRulesDef(
  rule: Ref<$InternalFormPropertyTypes>
): rule is Ref<$InternalRegleCollectionRuleDecl> {
  return !!rule.value && '$each' in rule.value;
}

export function isValidatorRulesDef(
  rule: Ref<$InternalFormPropertyTypes>
): rule is Ref<$InternalRegleRuleDecl> {
  return !!rule.value && isObject(rule.value);
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
