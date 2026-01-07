import type { ComputedRef } from 'vue';
import type {
  $InternalRegleShortcutDefinition,
  CustomRulesDeclarationTree,
  ResolvedRegleBehaviourOptions,
} from '../../../../types';
import type { RegleStorage } from '../../../useStorage';
import type { Ref } from 'vue';
import type { GlobalConfigOverrides } from '../../../defineRegleConfig';

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
  overrides: GlobalConfigOverrides | undefined;
}

export interface CommonResolverScopedState {
  $anyDirty: ComputedRef<boolean>;
  $invalid: ComputedRef<boolean>;
  $correct: ComputedRef<boolean>;
  $error: ComputedRef<boolean>;
  $pending: ComputedRef<boolean>;
  $name: ComputedRef<string>;
  $edited: Ref<boolean>;
  $anyEdited: ComputedRef<boolean>;
}
