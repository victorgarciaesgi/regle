import type { DevToolsV6PluginAPIHookPayloads } from '@vue/devtools-kit';
import type { App } from 'vue';
import {
  DevToolsMessagingHookKeys,
  DevToolsV6PluginAPIHookKeys,
  devtoolsContext,
  devtoolsState,
  getInspector,
} from '@vue/devtools-kit';
import { INSPECTOR_IDS } from './constants';
import type { DevtoolsV6PluginAPI } from './types';

/**
 * Bypasses Vue Devtools high-performance mode, where `api.sendInspectorTree()` is a no-op.
 */
async function syncInspectorToClient(inspectorId: string, app: App) {
  const inspector = getInspector(inspectorId, app);

  const treePayload: DevToolsV6PluginAPIHookPayloads[DevToolsV6PluginAPIHookKeys.GET_INSPECTOR_TREE] = {
    app,
    inspectorId,
    filter: inspector?.treeFilter ?? '',
    rootNodes: [],
  };

  await devtoolsContext.hooks.callHookWith(
    async (callbacks) => {
      await Promise.all(callbacks.map((cb) => cb(treePayload)));
    },
    DevToolsV6PluginAPIHookKeys.GET_INSPECTOR_TREE,
    treePayload
  );

  await devtoolsContext.hooks.callHookWith(
    async (callbacks) => {
      await Promise.all(
        callbacks.map((cb) =>
          cb({
            inspectorId,
            rootNodes: treePayload.rootNodes,
          })
        )
      );
    },
    DevToolsMessagingHookKeys.SEND_INSPECTOR_TREE_TO_CLIENT,
    {
      inspectorId,
      rootNodes: treePayload.rootNodes,
    }
  );

  const nodeId = inspector?.selectedNodeId ?? '';
  const statePayload: DevToolsV6PluginAPIHookPayloads[DevToolsV6PluginAPIHookKeys.GET_INSPECTOR_STATE] = {
    app,
    inspectorId,
    nodeId,
    state: {},
  };
  const stateCtx = { currentTab: `custom-inspector:${inspectorId}` };

  if (nodeId) {
    await devtoolsContext.hooks.callHookWith(
      async (callbacks) => {
        await Promise.all(callbacks.map((cb) => cb(statePayload, stateCtx)));
      },
      DevToolsV6PluginAPIHookKeys.GET_INSPECTOR_STATE,
      statePayload
    );
  }

  await devtoolsContext.hooks.callHookWith(
    async (callbacks) => {
      await Promise.all(
        callbacks.map((cb) =>
          cb({
            inspectorId,
            nodeId,
            state: statePayload.state,
          })
        )
      );
    },
    DevToolsMessagingHookKeys.SEND_INSPECTOR_STATE_TO_CLIENT,
    {
      inspectorId,
      nodeId,
      state: statePayload.state,
    }
  );
}

export async function emitInspectorState(api: DevtoolsV6PluginAPI, app?: App) {
  const inspectorId = INSPECTOR_IDS.INSPECTOR;

  if (app && (devtoolsState.clientConnected || devtoolsState.connected)) {
    await syncInspectorToClient(inspectorId, app);
    return;
  }

  api.sendInspectorTree(inspectorId);
  api.sendInspectorState(inspectorId);
}
