import type { PluginSetupFunction } from '@vue/devtools-kit';
import type { $InternalRegleStatusType, SuperCompatibleRegleRoot } from '../types';

export type DevtoolsV6PluginAPI = Parameters<PluginSetupFunction>[0];

export type FieldsDictionary = {
  [x: string]: $InternalRegleStatusType;
};

export interface RegleInstance {
  id: string;
  name: string;
  r$: SuperCompatibleRegleRoot;
  componentName?: string;
}

export type DevtoolsNotifyCallback = () => void;
