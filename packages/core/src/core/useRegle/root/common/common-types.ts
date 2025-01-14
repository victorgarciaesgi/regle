import type { ComputedRef } from 'vue';
import type {
  CustomRulesDeclarationTree,
  RegleShortcutDefinition,
  ResolvedRegleBehaviourOptions,
} from '../../../../types';
import type { RegleStorage } from '../../../useStorage';

export type StateWithId = unknown & { $id?: string };

export interface CommonResolverOptions {
  customMessages: CustomRulesDeclarationTree | undefined;
  path: string;
  index?: number;
  storage: RegleStorage;
  options: ResolvedRegleBehaviourOptions;
  fieldName: string;
  shortcuts: RegleShortcutDefinition | undefined;
}

export interface CommonResolverScopedState {
  $anyDirty: ComputedRef<boolean>;
  $invalid: ComputedRef<boolean>;
  $valid: ComputedRef<boolean>;
  $error: ComputedRef<boolean>;
  $pending: ComputedRef<boolean>;
  $name: ComputedRef<string>;
  $edited: ComputedRef<boolean>;
  $anyEdited: ComputedRef<boolean>;
}
