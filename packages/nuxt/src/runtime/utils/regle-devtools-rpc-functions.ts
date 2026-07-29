import {
  callInspectorAction,
  callInspectorNodeAction,
  editNodeValue,
  getInspectorMeta,
  getInspectorState,
  getInspectorTree,
  onRegleDevtoolsChange,
} from '@regle/core';
import { stringify } from '@vue/devtools-kit';
import { createHooks } from 'hookable';
import type { DevToolsV6PluginAPIHookPayloads } from '@vue/devtools-kit';

const hooks = createHooks();

export const REGLE_DEVTOOLS_MESSAGING_EVENTS = {
  INSPECTOR_TREE_UPDATED: 'inspector-tree-updated',
  INSPECTOR_STATE_UPDATED: 'inspector-state-updated',
  DEVTOOLS_STATE_UPDATED: 'devtools-state-updated',
} as const;

export function createRegleDevtoolsRpcFunctions() {
  const inspectorMeta = getInspectorMeta();

  return {
    on: (event: string, handler: (...args: unknown[]) => void) => {
      hooks.hook(event, handler);
    },
    off: (event: string, handler: (...args: unknown[]) => void) => {
      hooks.removeHook(event, handler);
    },
    once: (event: string, handler: (...args: unknown[]) => void) => {
      hooks.hookOnce(event, handler);
    },
    emit: (event: string, ...args: unknown[]) => {
      hooks.callHook(event, ...args);
    },
    heartbeat: () => true,
    devtoolsState: () => ({
      connected: true,
      clientConnected: true,
    }),
    async getInspectorTree(payload: { inspectorId: string; filter?: string }) {
      const rootNodes = getInspectorTree(payload.filter);
      return stringify(rootNodes);
    },
    async getInspectorState(payload: { inspectorId: string; nodeId: string }) {
      const state = getInspectorState(payload.nodeId);
      return stringify(state);
    },
    async editInspectorState(payload: DevToolsV6PluginAPIHookPayloads['editInspectorState']) {
      editNodeValue(payload);
    },
    callInspectorNodeAction(_inspectorId: string, actionIndex: number, nodeId: string) {
      callInspectorNodeAction(nodeId, actionIndex);
    },
    callInspectorAction(_inspectorId: string, actionIndex: number) {
      callInspectorAction(actionIndex);
    },
    getInspectorNodeActions(_inspectorId: string) {
      return inspectorMeta.nodeActions;
    },
    getInspectorActions(_inspectorId: string) {
      return inspectorMeta.actions;
    },
    getInspectorInfo(_inspectorId: string) {
      return {
        id: inspectorMeta.id,
        label: inspectorMeta.label,
        logo: inspectorMeta.logo,
        packageName: inspectorMeta.packageName,
        homepage: inspectorMeta.homepage,
        treeFilterPlaceholder: inspectorMeta.treeFilterPlaceholder,
        stateFilterPlaceholder: inspectorMeta.stateFilterPlaceholder,
        timelineLayers: [],
      };
    },
    getPluginSettings(_pluginId: string) {
      return {};
    },
    initDevToolsServerListener() {
      // handled via onRegleDevtoolsChange
    },
    unhighlight() {
      // no-op
    },
  };
}

export function setupRegleDevtoolsChangeBroadcast(broadcast: { emit: (event: string, payload: string) => void }) {
  const inspectorMeta = getInspectorMeta();

  return onRegleDevtoolsChange(() => {
    const rootNodes = getInspectorTree();
    broadcast.emit(
      REGLE_DEVTOOLS_MESSAGING_EVENTS.INSPECTOR_TREE_UPDATED,
      stringify({
        inspectorId: inspectorMeta.id,
        rootNodes,
      })
    );
  });
}
