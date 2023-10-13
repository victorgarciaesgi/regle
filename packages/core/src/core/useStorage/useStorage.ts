import { unwrapRuleParameters } from '../createRule/unwrapRuleParameters';
import { Ref, ref, shallowRef } from 'vue';
import {
  $InternalRegleCollectionStatus,
  $InternalRegleFieldStatus,
  $InternalRegleStatusType,
  RegleRuleDecl,
} from '../../types';

export type StoredRuleStatus = {
  $valid: Ref<boolean>;
  $pending: Ref<boolean>;
};

export type RegleStorage = {
  addRuleDeclEntry: ($path: string, rulesDef: RegleRuleDecl<any, any>) => void;
  setDirtyEntry: ($path: string, dirty: boolean) => void;
  checkRuleDeclEntry: (
    $path: string,
    newRules: RegleRuleDecl
  ) =>
    | {
        valid: boolean;
      }
    | undefined;
  getDirtyState: (path: string) => boolean;
  trySetRuleStatusRef(path: string): StoredRuleStatus;
  getFieldsEntry($path: string): Ref<Record<string, $InternalRegleStatusType>>;
  getCollectionsEntry($path: string): Ref<Array<$InternalRegleStatusType>>;
};

/**
 * Inspired by Vuelidate storage
 */
export function useStorage(): RegleStorage {
  const ruleDeclStorage = shallowRef(new Map<string, RegleRuleDecl<any, any>>());
  const fieldsStorage = shallowRef(
    new Map<string, Ref<Record<string, $InternalRegleStatusType>>>()
  );
  const collectionsStorage = shallowRef(new Map<string, Ref<Array<$InternalRegleStatusType>>>());
  const dirtyStorage = shallowRef(new Map<string, boolean>());
  const ruleStatusStorage = shallowRef(new Map<string, StoredRuleStatus>());

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

  function setDirtyEntry($path: string, dirty: boolean) {
    dirtyStorage.value.set($path, dirty);
  }

  function getDirtyState(path: string) {
    return dirtyStorage.value.get(path) ?? false;
  }

  function addRuleDeclEntry($path: string, options: RegleRuleDecl<any, any>) {
    ruleDeclStorage.value.set($path, options);
  }

  function checkRuleDeclEntry(
    $path: string,
    newRules: RegleRuleDecl
  ): { valid: boolean } | undefined {
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
      if (!newRuleElement._params) return true;
      return newRuleElement._params?.every((paramKey, index) => {
        const storedParams = unwrapRuleParameters(storedRuleElement._params as any[]);
        const newParams = unwrapRuleParameters(newRuleElement._params as any[]);
        return storedParams?.[index] === newParams?.[index];
      });
    });
  }

  function trySetRuleStatusRef(path: string): StoredRuleStatus {
    const ruleStatus = ruleStatusStorage.value.get(path);
    if (ruleStatus) {
      return ruleStatus;
    } else {
      const $pending = ref(false);
      const $valid = ref(true);
      ruleStatusStorage.value.set(path, { $pending, $valid });
      return { $pending, $valid };
    }
  }

  return {
    addRuleDeclEntry,
    setDirtyEntry,
    checkRuleDeclEntry,
    getDirtyState,
    trySetRuleStatusRef,
    getFieldsEntry,
    getCollectionsEntry,
  };
}
