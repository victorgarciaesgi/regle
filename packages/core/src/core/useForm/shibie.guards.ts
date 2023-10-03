import { Ref } from 'vue';
import {
  ShibieCollectionRuleDecl,
  ShibieFormPropertyType,
  ShibiePartialValidationTree,
} from '../../types';
import { isObject } from '../../utils';

export function isNestedRulesDef(
  state: Ref<unknown>,
  rule: Ref<ShibieFormPropertyType>
): rule is Ref<ShibiePartialValidationTree<any, any>> {
  return isObject(state.value) && isObject(rule.value);
}

export function isCollectionRulesDef(
  rule: Ref<ShibieFormPropertyType>
): rule is Ref<ShibieCollectionRuleDecl> {
  return !!rule.value && '$each' in rule.value;
}
