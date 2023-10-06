import { Ref } from 'vue';
import {
  FormRuleDeclaration,
  InlineRuleDeclaration,
  RegleCollectionRuleDecl,
  RegleFormPropertyType,
  ReglePartialValidationTree,
  RegleRuleDecl,
  RegleRuleDefinition,
} from '../../../types';
import { isObject } from '../../../utils';

export function isNestedRulesDef(
  state: Ref<unknown>,
  rule: Ref<RegleFormPropertyType>
): rule is Ref<ReglePartialValidationTree<any, any>> {
  return (
    isObject(state.value) &&
    isObject(rule.value) &&
    !Object.entries(rule.value).some((rule) => isRuleDef(rule))
  );
}

export function isCollectionRulesDef(
  rule: Ref<RegleFormPropertyType>
): rule is Ref<RegleCollectionRuleDecl> {
  return !!rule.value && '$each' in rule.value;
}

export function isValidatorRulesDef(
  rule: Ref<RegleFormPropertyType>
): rule is Ref<RegleRuleDecl<any, any>> {
  return !!rule.value && isObject(rule.value);
}

export function isRuleDef(rule: unknown): rule is RegleRuleDefinition {
  return isObject(rule) && '_validator' in rule;
}

export function isFormRuleDefinition(
  rule: Ref<unknown>
): rule is Ref<RegleRuleDefinition<any, any>> {
  return !(typeof rule.value === 'function');
}

export function isFormInline(rule: Ref<unknown>): rule is Ref<InlineRuleDeclaration<any>> {
  return typeof rule.value === 'function';
}
