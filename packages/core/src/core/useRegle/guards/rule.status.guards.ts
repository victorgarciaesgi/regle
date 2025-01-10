import { isObject } from '../../../../../shared';
import type {
  $InternalRegleErrors,
  $InternalRegleCollectionStatus,
  $InternalRegleFieldStatus,
  $InternalRegleRuleStatus,
  $InternalRegleStatus,
  $InternalRegleStatusType,
  RegleCollectionErrors,
  RegleExternalErrorTree,
} from '../../../types';

export function isNestedRulesStatus(rule: $InternalRegleStatusType): rule is $InternalRegleStatus {
  return isObject(rule) && '$fields' in rule;
}

export function isCollectionRulesStatus(rule: $InternalRegleStatusType): rule is $InternalRegleCollectionStatus {
  return !!rule && '$each' in rule;
}

export function isFieldStatus(rule: $InternalRegleStatusType): rule is $InternalRegleFieldStatus {
  return !!rule && '$rules' in rule;
}

export function isRuleStatus(rule: unknown): rule is $InternalRegleRuleStatus {
  return isObject(rule) && '$type' in rule && '$message' in rule;
}

//  -- ExternalErrors

export function isNestedExternalErrorStatus(rule: $InternalRegleErrors): rule is RegleExternalErrorTree<any> {
  return !!rule && '$each' in rule;
}

export function isCollectionExternalErrorStatus(rule: $InternalRegleErrors): rule is RegleCollectionErrors<any> {
  return !!rule && '$each' in rule;
}
