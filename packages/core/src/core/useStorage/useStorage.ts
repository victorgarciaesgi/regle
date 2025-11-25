import type { Ref } from 'vue';
import { getCurrentScope, onScopeDispose, ref, shallowRef } from 'vue';
import type { $InternalRegleStatusType, RegleRuleDecl } from '../../types';
import { unwrapRuleParameters } from '../createRule/unwrapRuleParameters';

export type StoredRuleStatus = {
  $valid: Ref<boolean>;
  $pending: Ref<boolean>;
  $metadata: Ref<Record<string, any>>;
  $validating: Ref<boolean>;
};

export type RegleStorage = ReturnType<typeof useStorage>;

/**
 * Inspired by Vuelidate storage
 */
export function useStorage() {
  const ruleDeclStorage = shallowRef(new Map<string, RegleRuleDecl<any, any>>());
  const fieldsStorage = shallowRef(new Map<string, Ref<Record<string, $InternalRegleStatusType>>>());
  const collectionsStorage = shallowRef(new Map<string, Ref<Array<$InternalRegleStatusType>>>());
  const dirtyStorage = shallowRef(new Map<string, boolean>());
  const ruleStatusStorage = shallowRef(new Map<string, StoredRuleStatus>());

  const arrayStatusStorage = shallowRef(new Map<string, $InternalRegleStatusType>());

  function getFieldsEntry($path: string): Ref<Record<string, $InternalRegleStatusType>> {
    const existingFields = fieldsStorage.value.get($path);
    if (existingFields) {
      return existingFields;
    } else {
      const $fields = ref({}) as Ref<Record<string, $InternalRegleStatusType>>;
      fieldsStorage.value.set($path, $fields);
      return $fields;
    }
  }

  function getCollectionsEntry($path: string): Ref<Array<$InternalRegleStatusType>> {
    const existingEach = collectionsStorage.value.get($path);
    if (existingEach) {
      return existingEach;
    } else {
      const $each = ref<Array<$InternalRegleStatusType>>([]);
      collectionsStorage.value.set($path, $each);
      return $each;
    }
  }

  // Collections

  function addArrayStatus($arrayId: string, itemId: string, value: $InternalRegleStatusType) {
    arrayStatusStorage.value.set(`${$arrayId}-${itemId}`, value);
  }

  function getArrayStatus($arrayId: string, itemId: string) {
    return arrayStatusStorage.value.get(`${$arrayId}-${itemId}`);
  }

  function deleteArrayStatus($arrayId: string, itemId?: string) {
    if ($arrayId && itemId != null) {
      arrayStatusStorage.value.delete(`${$arrayId}-${itemId}`);
    }
  }

  function setDirtyEntry($path: string, dirty: boolean) {
    dirtyStorage.value.set($path, dirty);
  }

  function getDirtyState(path: string) {
    return dirtyStorage.value.get(path) ?? false;
  }

  function addRuleDeclEntry($path: string, options: RegleRuleDecl<any, any>) {
    ruleDeclStorage.value.set($path, options);
  }

  function checkRuleDeclEntry($path: string, newRules: RegleRuleDecl): { valid: boolean } | undefined {
    const storedRulesDefs = ruleDeclStorage.value.get($path);

    if (!storedRulesDefs) return undefined;

    const storedRules = storedRulesDefs;

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
      // $debounce
      if (typeof newRuleElement === 'number') {
        return false;
        // $lazy, $autoDirty etc..
      } else if (typeof newRuleElement === 'boolean') {
        return false;
      } else if (typeof newRuleElement === 'string') {
        return false;
      } else if (!newRuleElement._params) {
        return true;
      } else {
        return newRuleElement._params?.every((paramKey, index) => {
          if (
            typeof storedRuleElement === 'number' ||
            typeof storedRuleElement === 'boolean' ||
            typeof storedRuleElement === 'string'
          ) {
            return true;
          } else {
            const storedParams = unwrapRuleParameters(storedRuleElement._params as any[]);
            const newParams = unwrapRuleParameters(newRuleElement._params as any[]);
            return storedParams?.[index] === newParams?.[index];
          }
        });
      }
    });
  }

  function trySetRuleStatusRef(path: string): StoredRuleStatus {
    const ruleStatus = ruleStatusStorage.value.get(path);
    if (ruleStatus) {
      return ruleStatus;
    } else {
      const $pending = ref(false);
      const $valid = ref(true);
      const $metadata = ref({});
      const $validating = ref(false);
      ruleStatusStorage.value.set(path, { $pending, $valid, $metadata, $validating });
      return { $pending, $valid, $metadata, $validating };
    }
  }

  if (getCurrentScope()) {
    onScopeDispose(() => {
      ruleDeclStorage.value.clear();
      fieldsStorage.value.clear();
      collectionsStorage.value.clear();
      dirtyStorage.value.clear();
      ruleStatusStorage.value.clear();
      arrayStatusStorage.value.clear();
    });
  }

  return {
    addRuleDeclEntry,
    setDirtyEntry,
    checkRuleDeclEntry,
    getDirtyState,
    trySetRuleStatusRef,
    getFieldsEntry,
    getCollectionsEntry,
    getArrayStatus,
    addArrayStatus,
    deleteArrayStatus,
    arrayStatusStorage,
  };
}
