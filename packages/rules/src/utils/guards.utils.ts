import type { RegleRuleDefinition } from '@regle/core';
import { isObject } from '../../../shared/utils/object.utils';

export function isRuleDef(rule: unknown): rule is RegleRuleDefinition<any, any[]> {
  return (isObject(rule) || typeof rule === 'function') && '_validator' in rule;
}
