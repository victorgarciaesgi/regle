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

export interface RegleDevtoolsRegistry {
  register: (
    r$: SuperCompatibleRegleRoot,
    options?: { name?: string; componentName?: string; uid?: number; filePath?: string }
  ) => string;
  unregister: (id: string) => void;
  getAll: () => RegleInstance[];
  get: (id: string) => RegleInstance | undefined;
  clear: () => void;
  setApi: (api: DevtoolsV6PluginAPI) => void;
  notifyDevtools: () => void;
  loggedWarning: { value: boolean };
  devtoolsApi: { value: DevtoolsV6PluginAPI | undefined };
}
