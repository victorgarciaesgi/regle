import { RegleFieldStatus, RegleRuleDecl, $InternalRegleRuleStatus } from 'types';
import { createSharedComposable } from '../../utils';
import { shallowRef } from 'vue';
import { unwrapRuleParameters } from 'core/createRule/unwrapRuleParameters';

export type StoredRulesResult = {
  rulesDef: RegleRuleDecl<any, any>;
};

/**
 * Inspired by Vuelidate storage
 */
function _useStorage() {
  const storage = shallowRef(new Map<string, StoredRulesResult>());
  const dirtyStorage = shallowRef(new Map<string, boolean>());

  function addEntry($path: string, options: StoredRulesResult) {
    storage.value.set($path, options);
  }

  function setDirtyEntry($path: string, dirty: boolean) {
    dirtyStorage.value.set($path, dirty);
  }

  function getDirtyState(path: string) {
    return dirtyStorage.value.get(path) ?? false;
  }

  function checkEntry($path: string, newRules: RegleRuleDecl): { valid: boolean } | undefined {
    const storedRulesResult = storage.value.get($path);

    if (!storedRulesResult) return undefined;

    const { rulesDef: storedRules } = storedRulesResult;

    const isValidCache = areRulesChanged(newRules, storedRules);

    if (!isValidCache) return { valid: false };
    return { valid: true };
  }

  function areRulesChanged(newRules: RegleRuleDecl, storedRules: RegleRuleDecl): boolean {
    const storedRulesKeys = Object.keys(storedRules);
    const newRulesKeys = Object.keys(newRules);

    if (newRulesKeys.length !== storedRulesKeys.length) return false;

    const hasAllValidators = newRulesKeys.every((ruleKey) => storedRulesKeys.includes(ruleKey));
    if (!hasAllValidators) return false;

    return newRulesKeys.every((ruleKey) => {
      const newRuleElement = newRules[ruleKey];
      const storedRuleElement = storedRules[ruleKey];
      if (
        !storedRuleElement ||
        !newRuleElement ||
        typeof newRuleElement === 'function' ||
        typeof storedRuleElement === 'function'
      )
        return false;
      if (!newRuleElement._params) return true;
      return newRuleElement._params?.every((paramKey, index) => {
        const storedParams = unwrapRuleParameters(storedRuleElement._params as any[]);
        const newParams = unwrapRuleParameters(newRuleElement._params as any[]);
        return storedParams?.[index] === newParams?.[index];
      });
    });
  }

  return { addEntry, setDirtyEntry, checkEntry, getDirtyState };
}

export const useStorage = createSharedComposable(_useStorage);
