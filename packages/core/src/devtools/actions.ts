import { INSPECTOR_IDS } from './constants';
import { regleDevtoolsRegistry } from './registry';
import { resolveFieldByPath } from './state-builder';
import type { DevtoolsV6PluginAPI } from './types';

export function handleValidateAction(nodeId: string, api: DevtoolsV6PluginAPI) {
  const isFieldNode = nodeId.includes(':field:');

  if (isFieldNode) {
    const [instanceId, _, fieldPath] = nodeId.split(':');
    const instance = regleDevtoolsRegistry.get(instanceId);

    if (instance && instance.r$.$fields) {
      const fieldStatus = resolveFieldByPath(instance.r$.$fields, fieldPath);
      if (fieldStatus && typeof fieldStatus.$validate === 'function') {
        fieldStatus.$validate();
      }
    }
  } else {
    const instance = regleDevtoolsRegistry.get(nodeId);

    if (instance && typeof instance.r$.$validate === 'function') {
      instance.r$.$validate();
    }
  }

  setTimeout(() => {
    api.sendInspectorState(INSPECTOR_IDS.INSPECTOR);
    api.sendInspectorTree(INSPECTOR_IDS.INSPECTOR);
  }, 100);
}

export function handleResetAction(nodeId: string, api: DevtoolsV6PluginAPI, resetState = false) {
  const isFieldNode = nodeId.includes(':field:');

  if (isFieldNode) {
    const [instanceId, _, fieldPath] = nodeId.split(':');
    const instance = regleDevtoolsRegistry.get(instanceId);

    if (instance && instance.r$.$fields) {
      const fieldStatus = resolveFieldByPath(instance.r$.$fields, fieldPath);
      if (fieldStatus && typeof fieldStatus.$reset === 'function') {
        fieldStatus.$reset({ toInitialState: resetState });
      }
    }
  } else {
    const instance = regleDevtoolsRegistry.get(nodeId);

    if (instance && typeof instance.r$.$reset === 'function') {
      instance.r$.$reset({ toInitialState: resetState });
    }
  }

  setTimeout(() => {
    api.sendInspectorState(INSPECTOR_IDS.INSPECTOR);
    api.sendInspectorTree(INSPECTOR_IDS.INSPECTOR);
  }, 100);
}
