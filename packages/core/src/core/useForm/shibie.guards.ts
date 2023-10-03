import { Ref, toRaw } from 'vue';
import {
  ShibieCollectionRuleDecl,
  ShibieFormPropertyType,
  ShibiePartialValidationTree,
  ShibieRuleDecl,
  ShibieRuleDefinition,
} from '../../types';
import { isObject } from '../../utils';

export function isNestedRulesDef(
  state: Ref<unknown>,
  rule: Ref<ShibieFormPropertyType>
): rule is Ref<ShibiePartialValidationTree<any, any>> {
  return (
    isObject(state.value) &&
    isObject(rule.value) &&
    !Object.entries(rule.value).some((rule) => isRuleDef(rule))
  );
}

export function isCollectionRulesDef(
  rule: Ref<ShibieFormPropertyType>
): rule is Ref<ShibieCollectionRuleDecl> {
  return !!rule.value && '$each' in rule.value;
}

export function isValidatorRulesDef(
  rule: Ref<ShibieFormPropertyType>
): rule is Ref<ShibieRuleDecl> {
  return !!rule.value && isObject(rule.value);
}

export function isRuleDef(rule: unknown): rule is ShibieRuleDefinition {
  return isObject(rule) && '_validator' in rule;
}
