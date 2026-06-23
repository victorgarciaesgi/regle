import { INSPECTOR_IDS } from './constants';
import type { DevtoolsV6PluginAPI } from './types';

export function emitInspectorState(api: DevtoolsV6PluginAPI) {
  api.sendInspectorTree(INSPECTOR_IDS.INSPECTOR);
  api.sendInspectorState(INSPECTOR_IDS.INSPECTOR);
}
