import type { MaybeRef, Ref } from 'vue';
import type {
  $InternalFormPropertyTypes,
  $InternalRegleCollectionRuleDecl,
  $InternalReglePartialRuleTree,
  $InternalRegleRuleDecl,
  InlineRuleDeclaration,
  RegleRuleDefinition,
} from '../../../types';
import { isEmpty, isObject } from '../../../../../shared';
import { isRefObject } from '../../../utils';

export function isNestedRulesDef(
  state: Ref<unknown>,
  rules: Ref<$InternalFormPropertyTypes>
): rules is Ref<$InternalReglePartialRuleTree> {
  return (
    isRefObject(state) ||
    (isObject(rules.value) &&
      !isEmpty(rules.value) &&
      !Object.entries(rules.value).some(([key, rule]) => isRuleDef(rule) || typeof rule === 'function'))
  );
}

export function isCollectionRulesDef(
  rules: Ref<$InternalFormPropertyTypes, any>,
  state: Ref<unknown>,
  schemaMode: boolean = false
): rules is Ref<$InternalRegleCollectionRuleDecl> {
  return (
    (!!rules.value && isObject(rules.value) && '$each' in rules.value) ||
    (schemaMode && Array.isArray(state.value) && state.value.some(isObject)) ||
    (Array.isArray(state.value) && state.value.some(isObject))
  );
}

export function isValidatorRulesDef(
  rules: MaybeRef<Ref<$InternalFormPropertyTypes>>
): rules is Ref<MaybeRef<$InternalRegleRuleDecl>> {
  return !!rules.value && (isObject(rules.value) || isRefObject(rules.value));
}

export function isRuleDef(rule: unknown): rule is RegleRuleDefinition<any, any[]> {
  return isObject(rule) && '_validator' in rule;
}

export function isFormRuleDefinition(rule: Ref<unknown>): rule is Ref<RegleRuleDefinition<any, any>> {
  if (typeof rule.value === 'function') {
    if ('_validator' in rule.value) {
      return true;
    }
    return false;
  }
  return true;
}

export function isFormInline(rule: Ref<unknown>): rule is Ref<InlineRuleDeclaration<any, any[], any>> {
  return typeof rule.value === 'function';
}

export function isStateArray(state: Ref<unknown>): state is Ref<(unknown & { $id?: string })[]> {
  return Array.isArray(state.value);
}
