import { setupDevtoolsPlugin } from '@vue/devtools-api';
import type { App } from 'vue';
import { handleEditInspectorState, handleResetAction, handleValidateAction } from './actions';
import { INSPECTOR_IDS } from './constants';
import { regleDevtoolsRegistry, watchRegleInstance } from './registry';
import { buildInspectorState } from './state-builder';
import { buildInspectorTree } from './tree-builder';
import type { DevtoolsV6PluginAPI } from './types';

export function createDevtools(app: App) {
  setupDevtoolsPlugin(
    {
      id: 'regle-devtools',
      label: 'Regle',
      logo: 'https://reglejs.dev/logo_main.png',
      packageName: '@regle/core',
      homepage: 'https://reglejs.dev',
      componentStateTypes: [],
      app,
    },
    (api) => {
      api.addInspector({
        id: INSPECTOR_IDS.INSPECTOR,
        label: 'Regle',
        noSelectionText: 'No instance selected',
        icon: 'rule',
        treeFilterPlaceholder: 'Filter',
        stateFilterPlaceholder: 'Filter validation status',
        nodeActions: [
          {
            icon: 'check_circle',
            tooltip: 'Validate (with `$validate`)',
            action: (nodeId) => {
              handleValidateAction(nodeId, api);
            },
          },
          {
            icon: 'refresh',
            tooltip: 'Reset validation state (with `$reset`)',
            action: (nodeId) => {
              handleResetAction(nodeId, api);
            },
          },
          {
            icon: 'restore',
            tooltip: 'Restore to initial state (with `$reset`)',
            action: (nodeId) => {
              handleResetAction(nodeId, api, true);
            },
          },
        ],
      });

      setupInstanceWatchers(api);

      api.on.getInspectorTree((payload) => {
        if (payload.inspectorId === INSPECTOR_IDS.INSPECTOR) {
          const instances = regleDevtoolsRegistry.getAll();
          const nodes = buildInspectorTree(instances, payload.filter);
          if (nodes.length > 0) {
            payload.rootNodes = nodes;
          } else {
            payload.rootNodes = [{ id: 'empty-regles', label: 'No Regles instances found', children: [] }];
          }
        }
      });

      api.on.getInspectorState((payload) => {
        if (payload.inspectorId === INSPECTOR_IDS.INSPECTOR) {
          const state = buildInspectorState(payload.nodeId, (id) => regleDevtoolsRegistry.get(id));

          if (state) {
            payload.state = state;
          } else {
            payload.state = {};
          }
        }
      });

      api.on.editInspectorState((payload) => {
        if (payload.inspectorId === INSPECTOR_IDS.INSPECTOR) {
          handleEditInspectorState(payload, api);
        }
      });
    }
  );
}

function setupInstanceWatchers(api: DevtoolsV6PluginAPI) {
  const watchedInstances = new Set<string>();

  const setupWatchers = () => {
    const instances = regleDevtoolsRegistry.getAll();

    instances.forEach((instance) => {
      const { r$, id } = instance;

      if (watchedInstances.has(id)) return;

      const stopHandle = watchRegleInstance(id, r$, () => {
        api.sendInspectorState(INSPECTOR_IDS.INSPECTOR);
        api.sendInspectorTree(INSPECTOR_IDS.INSPECTOR);
      });

      regleDevtoolsRegistry.addWatcher(id, stopHandle);

      watchedInstances.add(id);
    });
  };

  setupWatchers();

  regleDevtoolsRegistry.onInstancesChange(() => {
    const currentIds = new Set(regleDevtoolsRegistry.getAll().map((i) => i.id));

    // Remove watchers for instances that no longer exist
    for (const id of watchedInstances) {
      if (!currentIds.has(id)) {
        watchedInstances.delete(id);
      }
    }

    // Update the inspector tree (this will show empty tree if no instances)
    api.sendInspectorTree(INSPECTOR_IDS.INSPECTOR);

    // Also refresh the inspector state to clear any stale state
    api.sendInspectorState(INSPECTOR_IDS.INSPECTOR);

    setupWatchers();
  });
}
