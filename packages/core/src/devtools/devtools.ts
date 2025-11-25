import { setupDevtoolsPlugin } from '@vue/devtools-api';
import { type App } from 'vue';
import { handleEditInspectorState, handleResetAction, handleValidateAction } from './actions';
import { INSPECTOR_IDS } from './constants';
import { regleDevtoolsRegistry } from './registry';
import { buildInspectorState } from './state-builder';
import { buildInspectorTree } from './tree-builder';
import type { DevtoolsComponentInstance } from './types';
import { parseFieldNodeId } from './utils';

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
        nodeActions: [
          {
            icon: 'check_circle',
            tooltip: 'Validate',
            action: (nodeId) => {
              handleValidateAction(nodeId, api);
            },
          },
          {
            icon: 'refresh',
            tooltip: 'Reset validation state',
            action: (nodeId) => {
              handleResetAction(nodeId, api);
            },
          },
          {
            icon: 'restore',
            tooltip: 'Restore to original state',
            action: (nodeId) => {
              handleResetAction(nodeId, api, true);
            },
          },
        ],
      });

      regleDevtoolsRegistry.notifyDevtools();
      let componentInstances: DevtoolsComponentInstance[] = [];
      let selectedNodeId: string | null = null;

      api.on.getInspectorTree(async (payload) => {
        api.unhighlightElement();
        if (payload.inspectorId === INSPECTOR_IDS.INSPECTOR) {
          const instances = regleDevtoolsRegistry.getAll();
          const nodes = buildInspectorTree(instances, payload.filter);
          if (nodes.length > 0) {
            payload.rootNodes = nodes;
          } else {
            payload.rootNodes = [{ id: 'empty-regles', label: 'No Regles instances found', children: [] }];
          }

          componentInstances = await api.getComponentInstances(app);
        }
      });

      api.on.getInspectorState((payload) => {
        api.unhighlightElement();
        if (payload.inspectorId === INSPECTOR_IDS.INSPECTOR) {
          const state = buildInspectorState(payload.nodeId, (id) => regleDevtoolsRegistry.get(id));

          const instance = componentInstances.find((instance) => {
            const [componentName] = payload.nodeId?.split('#');
            return instance.uid.toString() === componentName;
          });

          if (instance?.uid && selectedNodeId !== payload.nodeId) {
            selectedNodeId = payload.nodeId;
            const fieldInfo = parseFieldNodeId(payload.nodeId);
            if (!fieldInfo) {
              api.highlightElement(instance);
            }
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
