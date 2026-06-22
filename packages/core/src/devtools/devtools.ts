import { setupDevtoolsPlugin } from '@vue/devtools-api';
import { type App } from 'vue';
import { handleEditInspectorState, handleResetAction, handleTouchAction, handleValidateAction } from './actions';
import { INSPECTOR_IDS } from './constants';
import { regleDevtoolsRegistry } from './registry';
import { buildInspectorState } from './state-builder';
import { buildInspectorTree } from './tree-builder';
import { version } from '../../package.json';

export function createDevtools(app: App) {
  setupDevtoolsPlugin(
    {
      id: 'regle-devtools',
      label: 'Regle',
      logo: 'https://reglejs.dev/logo_main.png',
      packageName: '@regle/core',
      homepage: 'https://reglejs.dev',
      componentStateTypes: ['Regles'],
      app,
    },
    (api) => {
      regleDevtoolsRegistry.setApi(api);

      api.addInspector({
        id: INSPECTOR_IDS.INSPECTOR,
        label: 'Regle',
        noSelectionText: 'No instance selected',
        icon: 'rule',
        treeFilterPlaceholder: 'Filter state',
        stateFilterPlaceholder: 'Filter validation status',
        actions: [
          {
            icon: 'confirmation_number',
            tooltip: 'Log Regle version',
            action: () => {
              console.info('Regle version', version);
            },
          },
        ],
        nodeActions: [
          {
            icon: 'check',
            tooltip: 'Validate',
            action: (nodeId) => {
              handleValidateAction(nodeId);
            },
          },
          {
            icon: 'touch_app',
            action: (nodeId) => {
              handleTouchAction(nodeId);
            },
            tooltip: 'Touch the instance with $touch',
          },
          {
            icon: 'refresh',
            tooltip: 'Reset validation state',
            action: (nodeId) => {
              handleResetAction(nodeId);
            },
          },
          {
            icon: 'restore',
            tooltip: 'Restore to original state',
            action: (nodeId) => {
              handleResetAction(nodeId, true);
            },
          },
        ],
      });

      regleDevtoolsRegistry.notifyDevtools();

      api.on.getInspectorTree(async (payload) => {
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
          if (!state) {
            api.sendInspectorTree(INSPECTOR_IDS.INSPECTOR);
          }

          if (state) {
            payload.state = state;
          } else {
            payload.state = {};
          }
        }
      });

      api.on.editInspectorState((payload) => {
        if (payload.inspectorId === INSPECTOR_IDS.INSPECTOR) {
          handleEditInspectorState(payload);
        }
      });
    }
  );
}
