import type { ComputedRef } from 'vue';
import type {
  $InternalRegleShortcutDefinition,
  CustomRulesDeclarationTree,
  ResolvedRegleBehaviourOptions,
} from '../../../../types';
import type { RegleStorage } from '../../../useStorage';

export type StateWithId = unknown & { $id?: string };

export interface CommonResolverOptions {
  customMessages: CustomRulesDeclarationTree | undefined;
  path: string;
  cachePath: string;
  index?: number;
  storage: RegleStorage;
  options: ResolvedRegleBehaviourOptions;
  fieldName: string | undefined;
  shortcuts: $InternalRegleShortcutDefinition | undefined;
}

export interface CommonResolverScopedState {
  $anyDirty: ComputedRef<boolean>;
  $invalid: ComputedRef<boolean>;
  $correct: ComputedRef<boolean>;
  $error: ComputedRef<boolean>;
  $pending: ComputedRef<boolean>;
  $name: ComputedRef<string>;
  $edited: ComputedRef<boolean>;
  $anyEdited: ComputedRef<boolean>;
}
