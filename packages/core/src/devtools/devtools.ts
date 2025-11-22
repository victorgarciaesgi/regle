import { setupDevtoolsPlugin } from '@vue/devtools-api';
import type { App } from 'vue';
import { COLORS, INSPECTOR_IDS } from './constants';
import { regleDevtoolsRegistry, watchRegleInstance } from './registry';
import { buildInspectorState } from './state-builder';
import { buildInspectorTree } from './tree-builder';
import { handleResetAction, handleValidateAction } from './actions';
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
        icon: 'rule',
        treeFilterPlaceholder: 'Search Regle instances...',
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

      api.addTimelineLayer({
        id: INSPECTOR_IDS.TIMELINE,
        label: 'Regle Events',
        color: COLORS.TIMELINE,
      });

      setupInstanceWatchers(api);

      api.on.getInspectorTree((payload) => {
        if (payload.inspectorId === INSPECTOR_IDS.INSPECTOR) {
          const instances = regleDevtoolsRegistry.getAll();
          payload.rootNodes = buildInspectorTree(instances);
        }
      });

      api.on.getInspectorState((payload) => {
        if (payload.inspectorId === INSPECTOR_IDS.INSPECTOR) {
          const state = buildInspectorState(payload.nodeId, (id) => regleDevtoolsRegistry.get(id));

          if (state) {
            payload.state = state;
          }
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

      watchRegleInstance(id, r$, () => {
        api.sendInspectorState(INSPECTOR_IDS.INSPECTOR);
        api.sendInspectorTree(INSPECTOR_IDS.INSPECTOR);
      });

      watchedInstances.add(id);
    });
  };

  setupWatchers();

  regleDevtoolsRegistry.onInstancesChange(() => {
    const currentIds = new Set(regleDevtoolsRegistry.getAll().map((i) => i.id));
    for (const id of watchedInstances) {
      if (!currentIds.has(id)) {
        watchedInstances.delete(id);
      }
    }

    api.sendInspectorTree(INSPECTOR_IDS.INSPECTOR);

    setupWatchers();
  });
}
