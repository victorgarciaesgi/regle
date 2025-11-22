import type { PluginSetupFunction } from '@vue/devtools-kit';
import type { $InternalRegleStatusType } from '../types';

/** Type is not exported by @vue/devtools-api */
export type DevtoolsV6PluginAPI = Parameters<PluginSetupFunction>[0];

export type FieldsDictionary = {
  [x: string]: $InternalRegleStatusType;
};

export interface InspectorNodeTag {
  label: string;
  textColor: number;
  backgroundColor: number;
}

export interface InspectorTreeNode {
  id: string;
  label: string;
  tags?: InspectorNodeTag[];
  children?: InspectorTreeNode[];
}

export interface InspectorStateItem {
  key: string;
  value: unknown;
  editable: boolean;
}

export interface InspectorState {
  [section: string]: InspectorStateItem[];
}
