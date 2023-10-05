import { Ref, toRaw } from 'vue';
import {
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

export function isValidatorRulesDef(rule: Ref<RegleFormPropertyType>): rule is Ref<RegleRuleDecl> {
  return !!rule.value && isObject(rule.value);
}

export function isRuleDef(rule: unknown): rule is RegleRuleDefinition {
  return isObject(rule) && '_validator' in rule;
}
