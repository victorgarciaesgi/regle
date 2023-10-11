import {
  $InternalRegleStatusType,
  RegleCollectionStatus,
  RegleFieldStatus,
  RegleRuleStatus,
  RegleStatus,
} from '../../../types';
import { isObject } from '../../../utils';

export function isNestedRulesStatus(rule: $InternalRegleStatusType): rule is RegleStatus<any, any> {
  return isObject(rule) && '$fields' in rule;
}

export function isCollectionRulesStatus(
  rule: $InternalRegleStatusType
): rule is RegleCollectionStatus<any, any> {
  return !!rule && '$each' in rule;
}

export function isFieldStatus(rule: $InternalRegleStatusType): rule is RegleFieldStatus<any, any> {
  return !!rule && '$rules' in rule;
}

export function isRuleStatus(rule: unknown): rule is RegleRuleStatus {
  return isObject(rule) && '$type' in rule && '$message' in rule;
}
