import type {
  $InternalExternalRegleErrors,
  $InternalRegleCollectionStatus,
  $InternalRegleFieldStatus,
  $InternalRegleRuleStatus,
  $InternalRegleStatus,
  $InternalRegleStatusType,
  RegleExternalCollectionErrors,
  RegleExternalErrorTree,
} from '../../../types';
import { isObject } from '../../../utils';

export function isNestedRulesStatus(rule: $InternalRegleStatusType): rule is $InternalRegleStatus {
  return isObject(rule) && '$fields' in rule;
}

export function isCollectionRulesStatus(
  rule: $InternalRegleStatusType
): rule is $InternalRegleCollectionStatus {
  return !!rule && '$each' in rule;
}

export function isFieldStatus(rule: $InternalRegleStatusType): rule is $InternalRegleFieldStatus {
  return !!rule && '$rules' in rule;
}

export function isRuleStatus(rule: unknown): rule is $InternalRegleRuleStatus {
  return isObject(rule) && '$type' in rule && '$message' in rule;
}

//  -- ExternalErrors

export function isNestedExternalErrorStatus(
  rule: $InternalExternalRegleErrors
): rule is RegleExternalErrorTree<any> {
  return !!rule && '$each' in rule;
}

export function isCollectionExternalErrorStatus(
  rule: $InternalExternalRegleErrors
): rule is RegleExternalCollectionErrors<any> {
  return !!rule && '$each' in rule;
}
