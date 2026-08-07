import { setupDevtoolsPlugin } from '@vue/devtools-api';
import { type App } from 'vue';
import {
  callInspectorAction,
  callInspectorNodeAction,
  editNodeValue,
  getInspectorMeta,
  getInspectorState,
  getInspectorTree,
  REGLE_DEVTOOLS_PLUGIN_ID,
} from './headless';
import { INSPECTOR_IDS } from './constants';
import { regleDevtoolsRegistry } from './registry';

export function createDevtools(app: App) {
  const inspectorMeta = getInspectorMeta();

  setupDevtoolsPlugin(
    {
      id: REGLE_DEVTOOLS_PLUGIN_ID,
      label: inspectorMeta.label,
      logo: inspectorMeta.logo,
      packageName: inspectorMeta.packageName,
      homepage: inspectorMeta.homepage,
      componentStateTypes: ['Regles'],
      app,
    },
    (api) => {
      regleDevtoolsRegistry.setApi(api);

      api.addInspector({
        id: INSPECTOR_IDS.INSPECTOR,
        label: inspectorMeta.label,
        noSelectionText: 'No instance selected',
        icon: 'rule',
        treeFilterPlaceholder: inspectorMeta.treeFilterPlaceholder,
        stateFilterPlaceholder: inspectorMeta.stateFilterPlaceholder,
        actions: inspectorMeta.actions.map((action, index) => ({
          icon: action.icon,
          tooltip: action.tooltip,
          action: () => {
            callInspectorAction(index);
          },
        })),
        nodeActions: inspectorMeta.nodeActions.map((action, index) => ({
          icon: action.icon,
          tooltip: action.tooltip,
          action: (nodeId) => {
            callInspectorNodeAction(nodeId, index);
          },
        })),
      });

      regleDevtoolsRegistry.notifyDevtools();

      api.on.getInspectorTree(async (payload) => {
        if (payload.inspectorId === INSPECTOR_IDS.INSPECTOR) {
          payload.rootNodes = getInspectorTree(payload.filter);
        }
      });

      api.on.getInspectorState((payload) => {
        if (payload.inspectorId === INSPECTOR_IDS.INSPECTOR) {
          const state = getInspectorState(payload.nodeId);
          if (!state || Object.keys(state).length === 0) {
            api.sendInspectorTree(INSPECTOR_IDS.INSPECTOR);
          }
          payload.state = state;
        }
      });

      api.on.editInspectorState((payload) => {
        if (payload.inspectorId === INSPECTOR_IDS.INSPECTOR) {
          editNodeValue(payload);
        }
      });
    }
  );
}
