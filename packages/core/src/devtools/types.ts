import type { PluginSetupFunction } from '@vue/devtools-kit';
import type { $InternalRegleFieldStatus, $InternalRegleStatusType, SuperCompatibleRegleRoot } from '../types';

export type DevtoolsV6PluginAPI = Parameters<PluginSetupFunction>[0];

export interface DevtoolsComponentInstance {
  uid: number;
  name: string;
  componentName: string;
}

export type FieldsDictionary = {
  [x: string]: $InternalRegleStatusType;
} & {
  $self?: $InternalRegleFieldStatus;
};

export interface RegleInstance {
  id: string;
  name: string;
  r$: SuperCompatibleRegleRoot;
  componentName?: string;
  filePath?: string;
}

export type DevtoolsNotifyCallback = () => void;
