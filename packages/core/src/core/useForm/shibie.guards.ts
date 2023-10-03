import {
  ShibieCollectionRuleDecl,
  ShibieFormPropertyType,
  ShibiePartialValidationTree,
} from '../../types';
import { isObject } from '../../utils';

export function isNestedRulesDef(
  state: unknown,
  rule: ShibieFormPropertyType
): rule is ShibiePartialValidationTree<any, any> {
  return isObject(state) && isObject(rule);
}

export function isCollectionRulesDef(
  rule: ShibieFormPropertyType
): rule is ShibieCollectionRuleDecl {
  return !!rule && '$each' in rule;
}
