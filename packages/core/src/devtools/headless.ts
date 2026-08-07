import type { CustomInspectorNode, CustomInspectorState, DevToolsV6PluginAPIHookPayloads } from '@vue/devtools-kit';
import { handleEditInspectorState, handleResetAction, handleTouchAction, handleValidateAction } from './actions';
import { INSPECTOR_IDS } from './constants';
import { regleDevtoolsRegistry } from './registry';
import { buildInspectorState } from './state-builder';
import { buildInspectorTree } from './tree-builder';
import { version } from '../../package.json';

export const REGLE_DEVTOOLS_PLUGIN_ID = 'regle-devtools';

const devtoolsChangeListeners = new Set<() => void>();

export function onRegleDevtoolsChange(callback: () => void): () => void {
  devtoolsChangeListeners.add(callback);
  return () => {
    devtoolsChangeListeners.delete(callback);
  };
}

export function emitRegleDevtoolsChange(): void {
  devtoolsChangeListeners.forEach((callback) => callback());
}

export function getInspectorTree(filter?: string): CustomInspectorNode[] {
  const instances = regleDevtoolsRegistry.getAll();
  const nodes = buildInspectorTree(instances, filter);

  if (nodes.length > 0) {
    return nodes;
  }

  return [{ id: 'empty-regles', label: 'No Regles instances found', children: [] }];
}

export function getInspectorState(nodeId: string): CustomInspectorState | Record<string, never> {
  const state = buildInspectorState(nodeId, (id) => regleDevtoolsRegistry.get(id));
  return state ?? {};
}

export function validateNode(nodeId: string): void {
  handleValidateAction(nodeId);
}

export function touchNode(nodeId: string): void {
  handleTouchAction(nodeId);
}

export function resetNode(nodeId: string, restore = false): void {
  handleResetAction(nodeId, restore);
}

export function editNodeValue(payload: DevToolsV6PluginAPIHookPayloads['editInspectorState']): void {
  handleEditInspectorState(payload);
}

export function getInspectorMeta() {
  return {
    id: INSPECTOR_IDS.INSPECTOR,
    pluginId: REGLE_DEVTOOLS_PLUGIN_ID,
    label: 'Regle',
    logo: 'https://reglejs.dev/logo_main.png',
    homepage: 'https://reglejs.dev',
    packageName: '@regle/core',
    treeFilterPlaceholder: 'Filter state',
    stateFilterPlaceholder: 'Filter validation status',
    version,
    nodeActions: [
      { icon: 'check', tooltip: 'Validate' },
      { icon: 'touch_app', tooltip: 'Touch the instance with $touch' },
      { icon: 'refresh', tooltip: 'Reset validation state' },
      { icon: 'restore', tooltip: 'Restore to original state' },
    ],
    actions: [{ icon: 'confirmation_number', tooltip: 'Log Regle version' }],
  };
}

export function callInspectorAction(actionIndex: number): void {
  if (actionIndex === 0) {
    console.info('Regle version', version);
  }
}

export function callInspectorNodeAction(nodeId: string, actionIndex: number): void {
  switch (actionIndex) {
    case 0:
      validateNode(nodeId);
      break;
    case 1:
      touchNode(nodeId);
      break;
    case 2:
      resetNode(nodeId, false);
      break;
    case 3:
      resetNode(nodeId, true);
      break;
  }
}
